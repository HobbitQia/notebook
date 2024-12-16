---
counter: True  
---

# LLM2Vec

!!! Abstract
    ![](https://cdn.hobbitqia.cc/20241216170636.png)

    * Paper: [LLM2Vec: Large Language ModelsAreSecretly Powerful Text Encoders](https://arxiv.org/pdf/2404.05961)
    * **COLM 2024**: Conference on Learning Modeling

## 介绍

* 现在 LLM 都是 decoder-only，不好处理 text embedding tasks，因此本文提出了 LLM2Vec 的方法，将 decoder-only LLM 转为 text encoder。方法如下：
    * 使用 bidreictional attention
    * 进行 masked next token prediction 微调
    * 无监督对比学习
* 之前的 LLM decoder-only 都是使用 casual attention，即只能看到之前的 token，不能看到之后的 token，这限制了 embedding 的能力。
* 但是 decoder-only LLM 有很多好处，他在训练时可以使用全部的输入 tokens（相反 encoder-only 的模型会 mask 15% tokens），而且有更丰富的生态，加上最近出现了指令微调如 RLHF 技术，因此作者认为 decoder-only LLM 作 embedding 有很大的潜力。
* 本文尝试了从 1.3B 到 8B 的模型（S-LLaMA-1.3B, LLaMA-2-7B, Mistral-7B, Meta-LLaMA-3-8B），在 MTEB 上达到了 SOTA。

## 方法

![](https://cdn.hobbitqia.cc/20241216165505.png)

* Enabling Bidirectional Attention，即将 decoder 中的 attention mask 替换为全 1 矩阵，这样就每个 token 都可以 access 到序列里的另一个 token。需要注意的是 decoder-only LLM 不是在这种条件下训练，因此这样修改后可能效果更差，需要进行调整来更好的利用双向注意力。
* Masked Next Token Prediction (MNTP)，类似于完形填空，需要注意的是当我们预测 token i 时，使用的基于前一个位置 i-1 的 loss。
* Unsupervised Contrastive Learning，虽然前两步可以将任何 decoder-only LLM 转化为 word-level encdoer，但对于 sequence representation 来说还不够。因此本文使用了 SimCSE 的方法：给定一个输入句子后，该句子会通过模型两次，并使用独立采样的 dropout mask，从而为同一个句子生成两个不同的表征。对模型进行训练，使这两个表征之间的相似性最大化，同时与批次中其他句子表征的相似性最小化。

## 实验

* Word-level

    <div align = center><img src="https://cdn.hobbitqia.cc/20241216170123.png" width=90%></div>

    * 单纯地修改注意力会导致性能的下降。
    * 可以看到基于 MNTP 的修改可以改善性能，但是和 SimCSE 结合后性能有所下降，这是因为 SimCSE 是关注 sentence level 的建模，因此在这里的任务里使用这个方法并不会带来收益。

* Sentence-level

    <div align = center><img src="https://cdn.hobbitqia.cc/20241216170307.png" width=90%></div>

    * 可以看到在 sentence-level 的任务 MTEB 上，SimCSE 的方法可以带来提升。

* 此外作者还发现，在 Mistral 模型上直接应用 bidirectional attention 而不加以微调也能取得良好的效果。作者推测 Mistral 模型至少在其训练的某些部分预先训练了某种形式的双向注意，具体探索留给未来工作。