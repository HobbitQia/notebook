---
counter: True   
---

# 语言模型是无监督的多任务学习者

!!! Abstract
    ![](https://cdn.hobbitqia.cc/20241102002951.png)

    * Paper: [Language Models are Unsupervised Multitask Learners](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf)
    * 参考资料：[Mu Li 的 b 站视频](https://www.bilibili.com/video/BV1AF411b7xQ/?spm_id_from=333.999.0.0)

## 介绍

* 技术路线与 GPT-1 一致（decoder-only）。
* 使用了更大的数据集 WebText（127000+），训练了更大的模型 GPT-2（参数量最大 1.5B）。
* 以前的路线：训练一个模型模拟正确行为，依赖于特定模型，泛化性不好。
    * 需要微调和特定任务的 labeled data。
    * 因此本文不使用微调，提出 Zero-shot 这个指标。
* Zero-shot 的情况下，8 个测试语言建模数据集中的 7 个数据集上取得了最先进的结果。

<!-- 问题在于如何打败 BERT。如果只是增大模型大小，但是依然无法比 BERT 好或者无法好太多 -->
<!-- research 要找新角度 -->

## 方法

* 模型与 GPT-1 一致，参数更多。

    <div align=center><img src = "https://cdn.hobbitqia.cc/20241102002836.png" width =40%></div>

* Zero-shot 时，下游任务的输入要与预训练使用的文本一致（否则模型无法理解输入）。语言里依次包括任务描述、输入以及输出（prompt）。

    ??? Example
        * 翻译：`(translate English to French, English text, French text)`
        * 问答：`(question answering, question, answer)`

* 数据集：
    * Common Crawl，太脏了不用。
    * WebText，从 Reddit 上爬取的数据（通过 karma 判断质量）。
* 输入表示：使用 BPE（Byte Pair Encoding）。

## 评论

* GPT 的问题在于如何打败 BERT。如果只是增大模型大小，但是依然无法比 BERT 好或者无法好太多，那么文章的意义不大。因此本文找了另一个角度：Zero-shot 作为主要卖点。
* 启示：做工程可以一条路走到黑，但是做 research 要尝试去找新角度。