# direct-android-ruleset

帮 Android 手机绕开国产 App 的包名合集。规则基于多个应用市场榜单自动抓取包名生成，每天自动更新 🍃

## 食用方法

### Mihomo (aka. Clash Meta)

```yaml
rule-providers:
  china-apps:
    type: http
    url: https://github.com/mnixry/direct-android-ruleset/raw/refs/heads/rules/@Merged/APP.mutated.yaml
    behavior: classical
  china-games:
    type: http
    url: https://github.com/mnixry/direct-android-ruleset/raw/refs/heads/rules/@Merged/GAME.mutated.yaml
    behavior: classical

rules:
  - RULE-SET,china-apps,DIRECT
  - RULE-SET,china-games,DIRECT
```

如果你发现你访问不了 `github.com`，自己想办法套个 jsDelivr CDN 之类的。

### Surgio

在 `surgio.conf.js` 中配置远程模板片段

```javascript
module.exports = {
  remoteSnippets: [
    ...,
    {
      name: "chinaApps",
      url: 'https://github.com/mnixry/direct-android-ruleset/raw/refs/heads/rules/@Merged/APP.mutated.tpl',
      surgioSnippet: true
    },
    {
      name: "chinaGames",
      url: 'https://github.com/mnixry/direct-android-ruleset/raw/refs/heads/rules/@Merged/GAME.mutated.tpl',
      surgioSnippet: true
    },
  ],
};
```

然后在模板规则里引用远程模板片段（以 `clash.tpl` 为例）

```yaml
rules:
{% filter clash %}
{{ remoteSnippet.chinaApps.main('DIRECT') }}
{{ remoteSnippet.chinaGames.main('DIRECT') }}
{% endfilter %}
```

详情参考 [Surgio 文档](https://surgio.js.org/guide/custom-template.html#%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8%E7%89%87%E6%AE%B5)。

### Others

没写，因为我暂时用不上。如果你要用的话欢迎 PR。

## 说明

仓库主分支为自动更新使用到的脚本文件。如果你发现：

- 某些应用应当被代理但是被错误地加入了该名单（比如 Google Play 服务、Chrome 等）
- 该名单上没有的冷门应用 （ROM 自带应用、国产应用商店等）

可以修改 [`config.yaml`](./config.yaml) 来达成你满意的结果，改好了记得交 PR（

规则文件统一放在 `rules` 分支下，由 GitHub Actions 保持自动更新。

- `@Merged` 文件夹下的文件为合并所有应用商店结果的规则文件
- 文件名有 `mutated` 的文件为经过 `config.yaml` 中配置的规则处理后的规则文件，文件名没有 `mutated` 的文件为原始规则文件。

## 开源许可

用的是 [AGPLv3](./LICENSE)。

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
