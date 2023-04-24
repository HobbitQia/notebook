---
counter: True  
---

# Android 触控事件数据流
<!-- !!! Abstract -->
## 基本概念

## 触摸事件模型

触摸事件大致流程如下
1. 捕获触控事件。有一个线程在不断的监听屏幕，一旦有触摸事件，就将事件捕获。  
2. 派发事件。因为可能有多个APP的多个界面为用户可见，必须找到目标窗口，确定这个事件究竟通知那个窗口，并把事件发送给目标窗口。  
3. 目标窗口消费事件。  

![1](http://cdn.hobbitqia.cc/202304222237156.png)

### 捕获触控事件

!!! Info "InputManagerService"
    InputManagerService 是 Android 为了处理各种用户操作而抽象的一个服务，自身可以看做是一个 Binder 服务实体，在 SystemServer 进程启动的时候实例化，并注册到 ServiceManager 中去。

InputManagerService 创建一个**事件读取线程**，创建一个**事件派发线程**。

EventHub 利用 Linux 的 inotify 和 epoll 机制，监听设备事件，面向的是 /dev/input 目录下的设备节点。通过 EventHub 的 `getEvents` 可以监听并获得该事件。

![2](http://cdn.hobbitqia.cc/202304222240340.png)

在 `new InputManager` 时候，会新建一个 `InputReaderThread` 线程及 `InputDispatcherThread` 线程。

* 这个 Reader 线程的主要作用就是通过 EventHub 的 `getEvents` 获取 Input 事件。    
`processEventsLocked` 会对事件进行初步封装为 RawEvent.  
Reader 里的 `loopOnce` 方法会在读取到事件后，`mQueuedListener->flush()` 即向 InputDispatcherThread 线程发送消息。  
* Dispatcher 线程起初处于睡眠状态，接受到消息后被唤醒，处理后继续睡眠。

<details>

``` Java
InputManager::InputManager(
        const sp<EventHubInterface>& eventHub,
        const sp<InputReaderPolicyInterface>& readerPolicy,
        const sp<InputDispatcherPolicyInterface>& dispatcherPolicy) {
    <!--事件分发执行类-->
    mDispatcher = new InputDispatcher(dispatcherPolicy);
    <!--事件读取执行类-->
    mReader = new InputReader(eventHub, readerPolicy, mDispatcher);
    initialize();
}

void InputManager::initialize() {
    mReaderThread = new InputReaderThread(mReader);     // 事件读取线程
    mDispatcherThread = new InputDispatcherThread(mDispatcher);     // 事件派发线程
}

bool InputReaderThread::threadLoop() {
    mReader->loopOnce();
    return true;
}

void InputReader::loopOnce() {
        int32_t oldGeneration;
        int32_t timeoutMillis;
        bool inputDevicesChanged = false;
        Vector<InputDeviceInfo> inputDevices;
        {  
      ...<!--监听事件-->
        size_t count = mEventHub->getEvents(timeoutMillis, mEventBuffer, EVENT_BUFFER_SIZE);
       ....<!--处理事件-->
           processEventsLocked(mEventBuffer, count);
       ...
       <!--通知派发-->
        mQueuedListener->flush();   // 向分发线程发送消息
    }
```
</details>

![3](http://cdn.hobbitqia.cc/202304222244149.png)

### 事件派发

<details>

``` Java
bool InputDispatcherThread::threadLoop() {
    mDispatcher->dispatchOnce();
    return true;
}

void InputDispatcher::dispatchOnce() {
    nsecs_t nextWakeupTime = LONG_LONG_MAX;
    {  
      <!--被唤醒 ，处理Input消息-->
        if (!haveCommandsLocked()) {
            dispatchOnceInnerLocked(&nextWakeupTime);
        }
       ...
    } 
    nsecs_t currentTime = now();
    int timeoutMillis = toMillisecondTimeoutDelay(currentTime, nextWakeupTime);
    <!--睡眠等待input事件-->
    mLooper->pollOnce(timeoutMillis);
}
```
</details>

![4](http://cdn.hobbitqia.cc/202304230834330.png)

如上文所说，在新建 `InputManager` 时也创建了一个事件派发进程. `InputDispatcherThread` 是一个 Looper 线程，基于 native 的 Looper 实现了 Hanlder 消息处理模型，如果有 Input 事件到来就被唤醒处理事件，处理完毕后继续睡眠等待。  
这里 `dispatchOnceInnerLocked` 是具体的派发逻辑。对于触摸事件会首先通过 `findTouchedWindowTargetsLocked` 找到目标 Window, 进而通过 `dispatchEventLocked` 将消息发送到目标窗口。

<details>

``` Java
void InputDispatcher::dispatchOnceInnerLocked(nsecs_t* nextWakeupTime) {
        ...
    case EventEntry::TYPE_MOTION: {
        MotionEntry* typedEntry = static_cast<MotionEntry*>(mPendingEvent);
        ...
        done = dispatchMotionLocked(currentTime, typedEntry,
                &dropReason, nextWakeupTime);
        break;
    }

bool InputDispatcher::dispatchMotionLocked(
        nsecs_t currentTime, MotionEntry* entry, DropReason* dropReason, nsecs_t* nextWakeupTime) {
    ...     
    Vector<InputTarget> inputTargets;
    bool conflictingPointerActions = false;
    int32_t injectionResult;
    if (isPointerEvent) {
    <!--关键点1 找到目标Window-->
        injectionResult = findTouchedWindowTargetsLocked(currentTime,
                entry, inputTargets, nextWakeupTime, &conflictingPointerActions);
    } else {
        injectionResult = findFocusedWindowTargetsLocked(currentTime,
                entry, inputTargets, nextWakeupTime);
    }
    ...
    <!--关键点2  派发-->
    dispatchEventLocked(currentTime, entry, inputTargets);
    return true;
}
```
</details>

#### 找到目标窗口

Android 系统能够同时支持多块屏幕，每块屏幕被抽象成一个 `DisplayContent` 对象，内部维护一个 `WindowList` 列表对象，用来记录当前屏幕中的所有窗口，包括状态栏、导航栏、应用窗口、子窗口等。

我们可以根据触摸事件的位置及窗口的属性遍历 `WindowList` 列表来确定将事件发送到哪个窗口。（判断是否可见、是否可触摸等信息）

#### 发送事件到目标窗口

目前所有逻辑在 SystemServer 进程，要通知的窗口位于 APP 端的用户进程。高版本的采用的都是 Socket 的通信方式，而比较旧的版本采用的是 Pipe 管道的方式。

其中，两端通信的 Socket, 在 APP 端向 WMS 请求添加窗口的时候，会伴随着 Input 通道的创建，窗口的添加一定会调用 `ViewRootImpl` 的 `setView` 函数。
<details>

``` Java
public void setView(View view, WindowManager.LayoutParams attrs, View panelParentView) {
    ...
    requestLayout();
    if ((mWindowAttributes.inputFeatures
            & WindowManager.LayoutParams.INPUT_FEATURE_NO_INPUT_CHANNEL) == 0) {
            <!--创建InputChannel容器-->
        mInputChannel = new InputChannel();
        // 创建一个空的 InputChannel
    }
    try {
        mOrigWindowType = mWindowAttributes.type;
        mAttachInfo.mRecomputeGlobalAttributes = true;
        collectViewAttributes();
        <!--添加窗口，并请求开辟Socket Input通信通道-->
        res = mWindowSession.addToDisplay(mWindow, mSeq, mWindowAttributes,
                getHostVisibility(), mDisplay.getDisplayId(),
                mAttachInfo.mContentInsets, mAttachInfo.mStableInsets,
                mAttachInfo.mOutsets, mInputChannel);
            // 这里会转化为对 addWindow 的调用
            // Binder 调用 WMS 的 addToDisplay 接口，并将 InputChanel 作为参数传入，以完成赋值
    }...
    <!--监听，开启Input信道-->
    if (mInputChannel != null) {    
        if (mInputQueueCallback != null) {
            mInputQueue = new InputQueue();
            mInputQueueCallback.onInputQueueCreated(mInputQueue);
        }
        mInputEventReceiver = new WindowInputEventReceiver(mInputChannel,
                Looper.myLooper());
        // 根据赋值后的 InputChannel 封装创建 WindowInputEventReceiver 对象，以便后续接收 Input 事件
    }
```
</details>

`setView` 中创建了 `InputChannel` 容器，它是 out 类型，需要由服务端进行填充。
<details>

``` Java
public int addWindow(Session session, IWindow client, int seq,
        WindowManager.LayoutParams attrs, int viewVisibility, int displayId,
        Rect outContentInsets, Rect outStableInsets, Rect outOutsets,
        InputChannel outInputChannel) {            
          ...
        if (outInputChannel != null && (attrs.inputFeatures
                & WindowManager.LayoutParams.INPUT_FEATURE_NO_INPUT_CHANNEL) == 0) {
            String name = win.makeInputChannelName();
            <!--创建 InputChannelPair, 实现创建 socketpair 全双工通信信道 -->
            InputChannel[] inputChannels = InputChannel.openInputChannelPair(name);
            // 创建通信信道，并分别填充到客户和服务的 InputChannel
            <!--本地用-->
            win.setInputChannel(inputChannels[0]);
            <!--APP端用-->
            inputChannels[1].transferTo(outInputChannel);
            // 将客户端 InputChannel 赋值给 outInputChannel, 并 Binder 回传给应用进程中 ViewRootImpl 中
            <!--注册信道与窗口-->
            mInputManager.registerInputChannel(win.mInputChannel, win.mInputWindowHandle);
            // mInputWindowHandle.token 唯一标识了接收 Input 事件的 App 窗口
        }
```
</details>

这里 `openInputChannelPair` 创建了 socketpair, 并分别填充到 Client 与 Server 的 InputChannel 中去。让 InputManager 将 Input 通信信道与当前的窗口 ID 绑定，最后通过 Binder 将 `outInputChannel` 回传到 APP 端。WMS 需要借助 Binder 通信向 APP 端回传文件描述符 fd.  


窗口添加成功后, socketpair 被创建，被传递到了 APP 端，但是信道并未完全建立，还需要一个主动的监听。  
APP 端的监听消息的手段是：将 socket 添加到 Looper 线程的 `epoll` 数组中去，一有消息到来 Looper 线程就会被唤醒，并获取事件内容，从代码上来看，通信信道的打开是伴随 WindowInputEventReceiver 的创建来完成的。

信息到来, Looper根据 fd 找到对应的监听器: NativeInputEventReceiver, 并调用 `handleEvent` 处理对应事件。之后会进一步读取事件，并封装成 Java 层对象，传递给 Java 层。
<details>

``` Java
int NativeInputEventReceiver::handleEvent(int receiveFd, int events, void* data) {
   ...
    if (events & ALOOPER_EVENT_INPUT) {
        JNIEnv* env = AndroidRuntime::getJNIEnv();
        status_t status = consumeEvents(env, false /*consumeBatches*/, -1, NULL);   
        mMessageQueue->raiseAndClearException(env, "handleReceiveCallback");
        return status == OK || status == NO_MEMORY ? 1 : 0;
    }
  ...
status_t NativeInputEventReceiver::consumeEvents(JNIEnv* env,  
        bool consumeBatches, nsecs_t frameTime, bool* outConsumedBatch) {  
        ...
    for (;;) {  
        uint32_t seq;  
        InputEvent* inputEvent;  
        <!--获取事件-->
        status_t status = mInputConsumer.consume(&mInputEventFactory,  
                consumeBatches, frameTime, &seq, &inputEvent);  
        ...
        <!--处理touch事件-->
      case AINPUT_EVENT_TYPE_MOTION: {
        MotionEvent* motionEvent = static_cast<MotionEvent*>(inputEvent);
        if ((motionEvent->getAction() & AMOTION_EVENT_ACTION_MOVE) && outConsumedBatch) {
            *outConsumedBatch = true;
        }
        inputEventObj = android_view_MotionEvent_obtainAsCopy(env, motionEvent);
        break;
        } 
    ...
```
</details>

最后就是触摸事件被封装成了 `InputEvent`, 并通过 InputEventReceiver 的 `dispatchInputEvent` 进行处理。InputEventReceiver 的 `dispatchInputEvent` 方法会调用 `onInputEvent` 具体处理 Input event 触控事件。

### 目标窗口消费事件

#### UI 线程对触控事件的分发处理

从 `ViewRootImpl::WindowInputDispatcherReceiver::onInputEvent` 函数开始, Input 事件先后来到 UI 线程，通过 `enqueueInputEvent` 函数放入本地待处理队列中。

具体对 Input 触控事件的处理逻辑都封装在 InputUsage 类中，在 ViewRootImpl 创建 Window 时的 `setView` 逻辑中会创建了多个不同类型的 InputUsage 对象依次进行事件处理，设计上采用责任链模式，将每个 InputStage 实现类通过 `mNext` 变量连接起来。  
每个 InputUsage 主要逻辑是在 `OnProcess` 函数中具体处理触控事件，然后判断处理是否完成，没有则 `onDeliverToNext` 交给下一个 InputUsage 继续处理，否则就调用 `finishInputEvent` 结束事件。

<details>

``` Java
 public void setView(View view, WindowManager.LayoutParams attrs, View panelParentView,
            int userId) {
            ...
                // Set up the input pipeline.
                CharSequence counterSuffix = attrs.getTitle();
                // 创建多个不同类型InputUsage以处理不同类型的触控事件
                mSyntheticInputStage = new SyntheticInputStage();
                // ViewPostImeInputStage中封装我们应用一般触控事件处理逻辑（重要）
                InputStage viewPostImeStage = new ViewPostImeInputStage(mSyntheticInputStage);
                InputStage nativePostImeStage = new NativePostImeInputStage(viewPostImeStage,
                        "aq:native-post-ime:" + counterSuffix);
                ...
    }

abstract class InputStage {
        ...
        /**
         * Delivers an event to be processed.
         */
        public final void deliver(QueuedInputEvent q) {
            // 是否带有FLAG_FINISHED的flag，如有则将事件分发给mNext
            if ((q.mFlags & QueuedInputEvent.FLAG_FINISHED) != 0) {
                forward(q);
             // 是否应该丢弃事件
            } else if (shouldDropInputEvent(q)) {
                finish(q, false);
            } else {
                traceEvent(q, Trace.TRACE_TAG_VIEW);
                final int result;
                try {
                    // 1.实际处理事件
                    result = onProcess(q);
                } finally {
                    Trace.traceEnd(Trace.TRACE_TAG_VIEW);
                }
                // 2.拿到处理事件的结果后决定进一步行动
                apply(q, result);
            }
        }
        
        protected void apply(QueuedInputEvent q, int result) {
            if (result == FORWARD) {
                forward(q);
            } else if (result == FINISH_HANDLED) {
                finish(q, true);
            } else if (result == FINISH_NOT_HANDLED) {
                finish(q, false);
            }
        }
        
        protected void finish(QueuedInputEvent q, boolean handled) {
            q.mFlags |= QueuedInputEvent.FLAG_FINISHED;
            if (handled) {
                q.mFlags |= QueuedInputEvent.FLAG_FINISHED_HANDLED;
            }
            // 交给下一个InputUsage继续处理
            forward(q);
        }
        
        protected void forward(QueuedInputEvent q) {
            // 交给下一个InputUsage继续处理
            onDeliverToNext(q);
        }
        
        protected void onDeliverToNext(QueuedInputEvent q) {
            if (DEBUG_INPUT_STAGES) {
                Log.v(mTag, "Done with " + getClass().getSimpleName() + ". " + q);
            }
            if (mNext != null) {
               // 1.交给下一个InputUsage继续处理
                mNext.deliver(q);
            } else {
                // 2.判断所有的InputUsage都处理完成则调用finishInputEvent结束触控事件
                finishInputEvent(q);
            }
        }
}
```
</details>
 
其中, `onProcess` 函数会把事件分发到 View 树的根节点 DecorView 的 `dispatchTouchEvent` 函数中，具体流程见 2.3.2.

处理完成后，调用 `finishInputEvent` 会通过 Client 端的 `InputChannel` 的 `sendMessage` 通知 InputDispatcher. 服务端的 InputDispatcher 在收到消息后将此触控事件移出等待队列。

#### View 的触控事件分发机制

其中 `Window.Callback` 指向当前 Activity. 这里我们会把事件交给 Activity 的 `dispatchTouchEvent` 处理事件。

``` Java
@Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        final Window.Callback cb = mWindow.getCallback();
        // 交给应用 Activity 的 dispatchTouchEvent 处理触控事件
        return cb != null && !mWindow.isDestroyed() && mFeatureId < 0
                ? cb.dispatchTouchEvent(ev) : super.dispatchTouchEvent(ev);
    }
```

Activity 中会先将事件交给 PhoneWindow 处理，实际上就是交给 DecorView 中处理. DecorView 会继续把事件交给其父类 ViewGroup 处理。

ViewGroup 中的事件分发的主要逻辑就是

* 判断子 View 中是否设置了禁止父 ViewGroup 拦截触控事件。  
（解决滑动冲突的一个主要思路就是子 View `通过调用requestDisallowInterceptTouchEvent` 禁止父 ViewGroup 拦截触控事件，从而将事件统一交给子 View 处理以避免产生滑动冲突）
* 若没有, `onInterceptTouchEvent` 判断是否拦截此事件（默认为 False)。
* 不拦截，则遍历所有子 View 找到匹配的子 View, 然后通过 `dispatchTransformedTouchEvent` 交给该子 View 的 `dispatchTouchEvent` 继续处理。

<details>

``` Java
 public boolean dispatchTouchEvent(MotionEvent ev) {
        ...
        if (onFilterTouchEventForSecurity(ev)) {
            ...
            if (actionMasked == MotionEvent.ACTION_DOWN
                    || mFirstTouchTarget != null) {
                // 1.判断子View中是否设置了禁止父ViewGroup拦截触控事件，解决滑动冲突的关键
                final boolean disallowIntercept = (mGroupFlags & FLAG_DISALLOW_INTERCEPT) != 0;
                if (!disallowIntercept) {
                    // onInterceptTouchEvent中判断ViewGroup是否拦截触控事件
                    intercepted = onInterceptTouchEvent(ev);
                }
            }
            ...
            if (!canceled && !intercepted) {
                if (actionMasked == MotionEvent.ACTION_DOWN
                        || (split && actionMasked == MotionEvent.ACTION_POINTER_DOWN)
                        || actionMasked == MotionEvent.ACTION_HOVER_MOVE) {
                    ...
                    if (newTouchTarget == null && childrenCount != 0) {
                        ...
                        final View[] children = mChildren;
                        // 2.对所有子View进行遍历
                        for (int i = childrenCount - 1; i >= 0; i--) {
                            ...
                            if (!child.canReceivePointerEvents()
                                    || !isTransformedTouchPointInView(x, y, child, null)) {
                               // 3.如果此View无法接收事件或者当前事件的或落点不在这个View区域内则返回进行下一轮循环
                                continue;
                            }
                            ...
                            // 4.这里就会执行子View事件分发处理逻辑了
                            if (dispatchTransformedTouchEvent(ev, false, child, idBitsToAssign)) {
                                ...
                                break;
                            }
                            ...
                        }
                    }
                    ...
                }
            }
        ...
    }
    
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        if (ev.isFromSource(InputDevice.SOURCE_MOUSE)
                && ev.getAction() == MotionEvent.ACTION_DOWN
                && ev.isButtonPressed(MotionEvent.BUTTON_PRIMARY)
                && isOnScrollbarThumb(ev.getX(), ev.getY())) {
            return true;
        }
        // ViewGroup默认不拦截事件
        return false;
    }
    
    private boolean dispatchTransformedTouchEvent(MotionEvent event, boolean cancel,
            View child, int desiredPointerIdBits) {
        ...
        // Perform any necessary transformations and dispatch.
        if (child == null) {
            handled = super.dispatchTouchEvent(transformedEvent);
        } else {
            ...
            // 调用子View的dispatchTouchEvent继续进行事件分发
            handled = child.dispatchTouchEvent(transformedEvent);
        }
        ...
    }
```
</details>

事件传递到 View 的 `dispatchTouchEvent` 后

* 判断该 View 是否设置了触摸监听，即是否调用过 `setOnTouchListener` 方法，如果有则将事件传入其 `onTouch` 方法进行处理并返回结果
* 没有设置，则会调用 View 的 `onTouchEvent` 方法，此方法中会有条件的调用 `onClick`  

<details>

``` Java
public boolean dispatchTouchEvent(MotionEvent event) {
        ...
        boolean result = false;
        if (onFilterTouchEventForSecurity(event)) {
            ...
            // 1.判断是否调用过setOnTouchListener方法，如果有则将事件传入其onTouch方法进行处理并返回结果
            if (li != null && li.mOnTouchListener != null
                    && (mViewFlags & ENABLED_MASK) == ENABLED
                    && li.mOnTouchListener.onTouch(this, event)) {
                result = true;
            }
            // 2.onTouchEvent中判断是否消费触控事件
            if (!result && onTouchEvent(event)) {
                result = true;
            }
        }
        ...
        return result;
    }
```
</details>