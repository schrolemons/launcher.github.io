---
title: HEXO美化：弹窗、昼夜切换调用
tags: hexo
abbrlink: 567f21d7
date: 2025-09-21 18:33:07
---
{% note primary flat %}

## sweetalert弹窗

{% endnote %}
{% note info flat %}

### step1：butterfly引入

{% endnote %}
在 `inject`的 `bottom`处加入：

```njk
<script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
```

{% note info flat %}

### step1：nexT引入

{% endnote %}
修改 `_layout.njk`:

```njk
<!DOCTYPE html>
<html lang="{{ page.lang }}">
<head>
  {{ partial('_partials/head/head.njk', {}, {cache: theme.cache.enable}) }}
  {%- include '_partials/head/head-unique.njk' -%}
  <title>{% block title %}{% endblock %}</title>
  {{ partial('_third-party/analytics/index.njk', {}, {cache: theme.cache.enable}) }}
  {{- next_inject('head') }}
  <noscript>
    <link rel="stylesheet" href="{{ url_for(theme.css) }}/noscript.css">
  </noscript>
</head>
<body itemscope itemtype="http://schema.org/WebPage"{% if theme.motion.enable %} class="use-motion"{% endif %}>
  <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.js"></script>
+【修改这里】  <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
  <div class="headband"></div>

  <main class="main">
    <div class="column">
      <header class="header" itemscope itemtype="http://schema.org/WPHeader">
        {%- include '_partials/header/index.njk' -%}
      </header>
      {%- if theme.sidebar.display !== 'remove' %}
        {% block sidebar %}{% endblock %}
      {%- endif %}
    </div>
```

{% note info flat %}

### step2：点击式调用

{% endnote %}
在指定文章内，输入：

```njk
<button id="btn1-1" class="btn btn-primary btn-lg m-3"> 按钮文字 </button>
```

并在文章末尾，输入：

```njk
<script>
  $('#btn1-1').click(function () {  //名字要与调用时的button id一致
    swal({
  title: "Good job!",
  text: "You clicked the button!",
  icon: "success",
  button: "Aww yiss!",
});

  })
</script>
```

更多效果请翻阅sweetalert官方文档。
{% note info flat %}

### step2：自动调用

{% endnote %}
在文章任意位置，输入：

```njk
<script>
if (sessionStorage.getItem("isPopupWindow") != "1") {
    swal({
  title: "TITLE",
  text: "text",
  icon: "success",
  button: "OK",
});
sessionStorage.setItem("isPopupWindow", "1");
}
</script>
```







{% note info flat %}

### 效果演示

{% endnote %}

点击下方按钮试试看：

<button id="btn1-1" class="btn-beautify button--animated" title="点击弹窗">🎉 点我弹窗</button>

<script>
(function wait() {
  if (typeof $ === 'undefined' || typeof swal === 'undefined') {
    setTimeout(wait, 200);
    return;
  }
  $('#btn1-1').click(function () {
    swal({
      title: "弹窗成功！",
      text: "你成功触发了自定义弹窗~",
      icon: "success",
      button: "知道啦",
    });
  });
})();
</script>



{% note primary flat %}

## 昼夜切换调用

{% endnote %}
{% note info flat %}

### step1：修改自定义js（如 `custom.js`）

{% endnote %}
添加：

```js
function darkmod(){
    document.documentElement.setAttribute('data-theme', 'dark')
    if (document.querySelector('meta[name="theme-color"]') !== null) {
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0d0d0d')
    }

}

function lightmod(){
    document.documentElement.setAttribute('data-theme', 'light')
    if (document.querySelector('meta[name="theme-color"]') !== null) {
        document.querySelector('meta[name="theme-color"]').setAttribute('content', 'ffffff')
    }
}
```

{% note info flat %}

### step2：修改导航栏

{% endnote %}

```text
  模式 || fas fa-adjust hide:
    黑夜模式:  javascript:darkmod()
    白昼模式: javascript:lightmod()
```

当然，也可以用超链接的方式调用：
[黑夜模式](javascript:darkmod())
[白昼模式](javascript:lightmod())
许多function都在内置文件中。利用**相似的方法**，可以自行调用很多函数。

---
