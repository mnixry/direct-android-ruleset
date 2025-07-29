{% macro main(rule) %}
PROCESS-NAME,cn.kuwo.player,{{ rule }} # 酷我音乐
PROCESS-NAME,com.achievo.vipshop,{{ rule }} # 唯品会
PROCESS-NAME,com.alibaba.android.rimet,{{ rule }} # 钉钉
PROCESS-NAME,com.baidu.appsearch,{{ rule }} # 百度手机助手
PROCESS-NAME,com.baidu.BaiduMap,{{ rule }} # 百度地图
PROCESS-NAME,com.baidu.homework,{{ rule }} # 作业帮
PROCESS-NAME,com.baidu.netdisk,{{ rule }} # 百度网盘
PROCESS-NAME,com.baidu.searchbox,{{ rule }} # 百度
PROCESS-NAME,com.cleanmaster.mguard_cn,{{ rule }} # 猎豹清理大师
PROCESS-NAME,com.eg.android.AlipayGphone,{{ rule }} # 支付宝
PROCESS-NAME,com.handsgo.jiakao.android,{{ rule }} # 驾考宝典
PROCESS-NAME,com.icoolme.android.weather,{{ rule }} # 最美天气
PROCESS-NAME,com.immomo.momo,{{ rule }} # MOMO陌陌
PROCESS-NAME,com.jingdong.app.mall,{{ rule }} # 京东
PROCESS-NAME,com.kugou.android,{{ rule }} # 酷狗音乐
PROCESS-NAME,com.meitu.meiyancamera,{{ rule }} # 美颜相机-AI换装
PROCESS-NAME,com.moji.mjweather,{{ rule }} # 墨迹天气
PROCESS-NAME,com.mt.mtxx.mtxx,{{ rule }} # 美图秀秀
PROCESS-NAME,com.qihoo.appstore,{{ rule }} # 360手机助手
PROCESS-NAME,com.qihoo360.mobilesafe,{{ rule }} # 360手机卫士
PROCESS-NAME,com.qiyi.video,{{ rule }} # 爱奇艺
PROCESS-NAME,com.qzone,{{ rule }} # QQ空间
PROCESS-NAME,com.sdu.didi.psnger,{{ rule }} # 滴滴出行
PROCESS-NAME,com.shoujiduoduo.ringtone,{{ rule }} # 铃声多多
PROCESS-NAME,com.sina.weibo,{{ rule }} # 微博
PROCESS-NAME,com.smile.gifmaker,{{ rule }} # 快手
PROCESS-NAME,com.snda.wifilocating,{{ rule }} # WiFi万能钥匙
PROCESS-NAME,com.sohu.inputmethod.sogou,{{ rule }} # 搜狗输入法
PROCESS-NAME,com.sohu.sohuvideo,{{ rule }} # 搜狐视频
PROCESS-NAME,com.ss.android.article.lite,{{ rule }} # 今日头条极速版
PROCESS-NAME,com.ss.android.article.news,{{ rule }} # 今日头条
PROCESS-NAME,com.ss.android.article.video,{{ rule }} # 西瓜视频
PROCESS-NAME,com.ss.android.ugc.aweme,{{ rule }} # 抖音
PROCESS-NAME,com.taobao.taobao,{{ rule }} # 淘宝
PROCESS-NAME,com.tencent.karaoke,{{ rule }} # 全民K歌
PROCESS-NAME,com.tencent.mm,{{ rule }} # 微信
PROCESS-NAME,com.tencent.mobileqq,{{ rule }} # QQ
PROCESS-NAME,com.tencent.mtt,{{ rule }} # QQ浏览器
PROCESS-NAME,com.tencent.news,{{ rule }} # 腾讯新闻
PROCESS-NAME,com.tencent.qqlive,{{ rule }} # 腾讯视频
PROCESS-NAME,com.tencent.qqmusic,{{ rule }} # QQ音乐
PROCESS-NAME,com.tencent.qqpim,{{ rule }} # QQ同步助手
PROCESS-NAME,com.tencent.qqpimsecure,{{ rule }} # 腾讯手机管家
PROCESS-NAME,com.UCMobile,{{ rule }} # UC浏览器
PROCESS-NAME,com.wuba,{{ rule }} # 58同城
PROCESS-NAME,com.xunmeng.pinduoduo,{{ rule }} # 拼多多
PROCESS-NAME,com.youku.phone,{{ rule }} # 优酷视频
PROCESS-NAME,com.alicom.smartdial,{{ rule }}
PROCESS-NAME,com.bilibili.app.in,{{ rule }}
PROCESS-NAME,me.gfuil.bmap,{{ rule }}
PROCESS-NAME,cn.com.bmac.nfc,{{ rule }}
PROCESS-NAME,com.nowcasting.activity,{{ rule }}
PROCESS-NAME,com.coolapk.market,{{ rule }}
PROCESS-NAME,com.unionpay.tsmservice,{{ rule }}
PROCESS-NAME-REGEX,^com\.(?:heytap|oppo|coloros|oneplus|oplus)\..*,{{ rule }}
PROCESS-NAME-REGEX,^com\.huawei\..*,{{ rule }}
PROCESS-NAME-REGEX,^com\.vivo\..*,{{ rule }}
PROCESS-NAME-REGEX,^com\.(?:xiaomi|miui)\..*,{{ rule }}
PROCESS-NAME-REGEX,^com\.tencent\..*,{{ rule }}
PROCESS-NAME-REGEX,^com\.hypergryph\..*,{{ rule }}
{% endmacro %}