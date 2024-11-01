---
counter: True   
---



# 语言模型是 Few-shot 学习者

!!! Abstract
    ![](https://cdn.hobbitqia.cc/20241102004222.png)

    * Paper: [Language Models are Few-Shot Learners](https://arxiv.org/pdf/2005.14165.pdf)
    * 参考资料：[Mu Li 的 b 站视频](https://www.bilibili.com/video/BV1AF411b7xQ/?spm_id_from=333.999.0.0)

## 介绍

* 技术路线与 GPT-1 一致（decoder-only），但 GPT-3 更大（参数量最大 175B）。
* 最近的 NLP 任务普遍采用预训练+微调的方式，存在下面的问题：
    * 需要 labeled data。
    * 无法说明泛化性。因为模型在下游任务的性能可能是因为微调的结果，而不是预训练的结果。这就无法反映预训练模型的泛化性，而且预训练模型的性能可能不那么重要。
    * 在模拟人类学习的过程中，我们是不需要很大的监督数据集来学习的。通常只需要几个例子就可以学会一个新任务。
* 因此 GPT-3 不使用微调，使用 Zero-shot / Few-shot，同时使用了 meta-learning 和 in-context learning。
    * meta-learning: 模型在训练时发展出一套广泛的技能和模式识别能力，然后在推理时利用这些能力快速适应或识别所需的任务。
    * in-context learning: 预训练模型以自然语言指令和/或任务的一些演示为条件，然后只需预测接下来会发生什么，就能完成任务的其他实例。

## 方法

!!! "微调与 Zero-shot, One-shot, Few-shot"
    <div align=center><img src = "https://cdn.hobbitqia.cc/20241102004240.png" width =70%></div>

    * 微调要求的数据量比从 0 开始训练少，而且以预训练模型作为起始权重，可以设置较小的学习率。但是对于大模型（比如 GPT-3），微调的成本依然非常高。
    * 如上图 `=>` 相当于 prompt 提示符，One-shot 提供一个示例，Few-shot 提供多个示例。
        * 输入的样本更多不一定有用，因为模型支持的长序列有限。如果输入过长可能无法建模长文本序列，而且不能利用之前用过的样本（每次都要重新输入）。

* 模型架构 decoder-only

    <div align=center><img src = "https://cdn.hobbitqia.cc/20241102004700.png" width =70%></div>

* 数据集
    * Common Crawl，但是进行了分类过滤（将 GPT-2 的数据集作为正样本，Common Crawl 作为负样本，训练一个分类器），将输入为正的结果放入过滤后的数据集中。
    * 添加了已知的高质量参考语料，如 WebText。
    * 利用 LSH 对结果进行了去重。
    * 尽管如此，不同数据集的采样率依然不同。虽然 Common Crawl 的数据量很大，但是质量不高，因此我们设置的权重较小（相比于数据集的规模）。

        <div align=center><img src = "https://cdn.hobbitqia.cc/20241102005054.png" width =70%></div>

## 限制

* 文本生成方面比较弱。有时仍会在文档层面出现语义重复，在足够长的段落中开始失去连贯性，出现自相矛盾的情况，偶尔还会包含非连续句子或段落。
* 语言模型的问题，即只能往前看，不能像 BERT 那样看前后的文本。
* 目前的目标函数是对每个标记进行同等加权，缺乏对哪些标记最重要、哪些不那么重要进行预测的概念。
* 预训练时的采样效率仍然比较低，实际上人类在学习时不需要如此多的数据。
* 无法确定现在的表现是来自 GPT-3 的学习能力，还是因为数据集中有以前出现过的类似的样本。
* 训练成本高。
* 与 DL 类似，缺乏可解释性。

文章还介绍了 GPT-3 的一些安全问题，如误用、性别/种族/宗教偏见、能耗等。