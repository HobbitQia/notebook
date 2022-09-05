# Hexo Next Giscus

![Theme Version](https://img.shields.io/badge/NexT-v8.4.0+-blue?style=flat-square)
![Package Version](https://img.shields.io/github/package-json/v/next-theme/hexo-next-giscus?style=flat-square)
![License](https://img.shields.io/github/license/next-theme/hexo-next-giscus?style=flat-square)

[Giscus](https://giscus.app) comments system powered by [GitHub Discussions](https://docs.github.com/en/discussions) for [NexT](https://theme-next.js.org).

## Install

```bash
$ npm install hexo-next-giscus --save
```

## Configure

You can config those in both **hexo** or **theme** `_config.yml`
```yaml
giscus:
  enable: false
  repo: # Github repository name
  repo_id: # Github repository id
  category: # Github discussion category
  category_id: # Github discussion category id
  # Available values: pathname | url | title | og:title
  mapping: pathname
  # Available values: 0 | 1 
  reactions_enabled: 1
   # Available values: 0 | 1 
  emit_metadata: 1
  # Available values: light | dark | dark_high_contrast | transparent_dark | preferred-color-scheme
  theme: light
  # Available values: en | zh-C
  lang: en
  # Available value: anonymous
  crossorigin: anonymous
  # Place the comment box above the comments
  input_position: bottom
  # Load the comments lazily
  loading: lazy
```
