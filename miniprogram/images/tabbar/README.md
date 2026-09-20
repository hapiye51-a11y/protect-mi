# TabBar 图标说明

## 需要的图标文件

请在 `images/tabbar/` 目录下放置以下图标文件（推荐尺寸：81px × 81px）：

### 1. 首页
- `home.png` - 未选中状态（灰色）
- `home-active.png` - 选中状态（橙色 #FF9800）

### 2. 地图
- `map.png` - 未选中状态
- `map-active.png` - 选中状态

### 3. 发布
- `publish.png` - 未选中状态
- `publish-active.png` - 选中状态

### 4. 档案
- `profiles.png` - 未选中状态
- `profiles-active.png` - 选中状态

### 5. 我的
- `mine.png` - 未选中状态
- `mine-active.png` - 选中状态

## 在线图标资源推荐

可以使用以下图标资源网站：

1. **IconFont (阿里巴巴矢量图标库)**
   - https://www.iconfont.cn/

2. **Flaticon**
   - https://www.flaticon.com/

3. **Icons8**
   - https://icons8.com/

4. **Feather Icons**
   - https://feathericons.com/

5. **Heroicons**
   - https://heroicons.com/

## 推荐图标风格

- 图标风格：线性图标（Outline）
- 线条粗细：2px
- 颜色：
  - 未选中：#9CA3AF（灰色）
  - 选中：#FF9800（橙色）

## 图标尺寸要求

- 建议尺寸：81px × 81px
- 格式：PNG
- 背景：透明

## 添加图标后

完成图标准备后，修改 `app.json` 中的 tabBar 配置：

```json
{
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "images/tabbar/home.png",
        "selectedIconPath": "images/tabbar/home-active.png"
      },
      ...
    ]
  }
}
```
