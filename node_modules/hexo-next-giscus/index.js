/* global hexo */

'use strict';

const Util = require('@next-theme/utils');
const utils = new Util(hexo, __dirname);

hexo.extend.filter.register('theme_inject', injects => {

  let config = utils.defaultConfigFile('giscus', 'default.yaml');
  if (!config.enable) return;

  if (!config.repo) {
      hexo.log.warn(`giscus.repo can't be null.`);
      return;
  }

  injects.comment.raw('giscus', `
  {% if page.comments %}
  <div class="comments">
    <script src="https://giscus.app/client.js"
        data-repo="${config.repo}" 
        data-repo-id="${config.repo_id}" 
        data-category="${config.category}"
        data-category-id="${config.category_id}"
        data-mapping="${config.mapping}" 
        data-reactions-enabled="${config.reactions_enabled}" 
        data-emit-metadata="${config.emit_metadata}" 
        data-theme="${config.theme}"
        data-lang="${config.lang}"
        crossorigin="${config.crossorigin}"
        data-input-position="${config.input_position}"
        data-loading="${config.loading}"
        async>
    </script>
  </div>
  {% endif %}
  `);

  injects.style.push(utils.getFilePath('giscus.styl'));

}, (hexo.config.giscus || {}).priority);