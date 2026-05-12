/**
 * 预设数据文件
 * 当 localStorage 中没有数据时，自动加载这些预设数据
 */

const PRESET_DATA = {
  // 订单数据（来自用户上传的图片）
  orders: [
    { orderNo: "J26000-27", productType: "环网箱-环保空气绝缘", quantity: "1", orderDate: "2026/4/22", designDate: "2026/4/26", createdAt: "2026-04-22T00:00:00.000Z" },
    { orderNo: "J26000-27", productType: "环网箱-固体绝缘", quantity: "1", orderDate: "2026/4/22", designDate: "2026/4/26", createdAt: "2026-04-22T00:00:01.000Z" },
    { orderNo: "J24051-24", productType: "配电箱", quantity: "1", orderDate: "2026/4/20", designDate: "2026/5/10", createdAt: "2026-04-20T00:00:00.000Z" },
    { orderNo: "J25088-11", productType: "环网箱-固体绝缘", quantity: "1", orderDate: "2026/4/18", designDate: "2026/5/5", createdAt: "2026-04-18T00:00:00.000Z" },
    { orderNo: "J25041-19", productType: "环网箱-环保空气绝缘", quantity: "1", orderDate: "2026/4/25", designDate: "2026/5/15", createdAt: "2026-04-25T00:00:00.000Z" },
    { orderNo: "J25055-02-00", productType: "环网柜", quantity: "1", orderDate: "2026/4/28", designDate: "2026/5/20", createdAt: "2026-04-28T00:00:00.000Z" },
    { orderNo: "J25055-06", productType: "环网柜", quantity: "1", orderDate: "2026/4/30", designDate: "2026/5/25", createdAt: "2026-04-30T00:00:00.000Z" },
    { orderNo: "J25055-03", productType: "环网柜", quantity: "1", orderDate: "2026/5/3", designDate: "2026/5/28", createdAt: "2026-05-03T00:00:00.000Z" },
    { orderNo: "J25038", productType: "SGN-GB", quantity: "1", orderDate: "2026/4/18", designDate: "2026/5/8", createdAt: "2026-04-18T00:00:00.000Z" },
    { orderNo: "TEST001", productType: "GGD", quantity: "1", orderDate: "2026/5/5", designDate: "2026/6/5", createdAt: "2026-05-05T00:00:00.000Z" },
    { orderNo: "J25089-11", productType: "环保柜", quantity: "1", orderDate: "2026/5/6", designDate: "2026/6/1", createdAt: "2026-05-06T00:00:00.000Z" },
    { orderNo: "J25089-15", productType: "环保柜", quantity: "1", orderDate: "2026/5/6", designDate: "2026/6/1", createdAt: "2026-05-06T00:00:01.000Z" },
    { orderNo: "J25089-16", productType: "环保柜", quantity: "1", orderDate: "2026/5/6", designDate: "2026/6/1", createdAt: "2026-05-06T00:00:02.000Z" },
    { orderNo: "J25089-13", productType: "环保柜", quantity: "1", orderDate: "2026/5/6", designDate: "2026/6/1", createdAt: "2026-05-06T00:00:03.000Z" },
    { orderNo: "J25089-12", productType: "环保柜", quantity: "1", orderDate: "2026/5/6", designDate: "2026/6/1", createdAt: "2026-05-06T00:00:04.000Z" },
    { orderNo: "J25089-14", productType: "环保柜", quantity: "1", orderDate: "2026/5/6", designDate: "2026/6/1", createdAt: "2026-05-06T00:00:05.000Z" }
  ],

  // 工程师数据
  engineers: [
    { name: "黄超", role: "电气", createdAt: "2026-04-08T00:00:00.000Z" },
    { name: "黄海涛", role: "电气", createdAt: "2026-04-08T00:00:01.000Z" },
    { name: "梁凯豪", role: "结构", createdAt: "2026-04-08T00:00:02.000Z" },
    { name: "马俊贤", role: "结构", createdAt: "2026-04-08T00:00:03.000Z" },
    { name: "毛浚远", role: "结构", createdAt: "2026-04-08T00:00:04.000Z" },
    { name: "莫植浩", role: "结构", createdAt: "2026-04-08T00:00:05.000Z" },
    { name: "彭泽锋", role: "电气", createdAt: "2026-04-08T00:00:06.000Z" },
    { name: "王康伟", role: "电气", createdAt: "2026-04-08T00:00:07.000Z" },
    { name: "阳锦涛", role: "结构", createdAt: "2026-04-08T00:00:08.000Z" },
    { name: "张南", role: "电气", createdAt: "2026-04-08T00:00:09.000Z" },
    { name: "赵志伸", role: "电气", createdAt: "2026-04-08T00:00:10.000Z" }
  ],

  // 进度类型数据
  progressTypes: [
    { name: "一次电气", role: "电气", products: "环网柜、环网箱、配电箱、GCK、中置柜、其他", createdAt: "2026-04-15T00:00:00.000Z" },
    { name: "气箱", role: "结构", products: "环网柜、环网箱、配电箱、GCK、中置柜、其他", createdAt: "2026-04-15T00:00:01.000Z" },
    { name: "二次电气(一次设备)", role: "电气", products: "环网柜、环网箱、配电箱、GCK、中置柜、其他", createdAt: "2026-04-15T00:00:02.000Z" },
    { name: "二次电气", role: "电气", products: "环网柜、环网箱、配电箱、GCK、中置柜、其他", createdAt: "2026-04-15T00:00:03.000Z" },
    { name: "钣金(一次设备)", role: "结构", products: "环网柜、环网箱、配电箱、GCK、中置柜、其他", createdAt: "2026-04-15T00:00:04.000Z" },
    { name: "DTU电气", role: "电气", products: "DTU设备相关", createdAt: "2026-04-15T00:00:05.000Z" },
    { name: "户外箱", role: "结构", products: "户外箱体相关", createdAt: "2026-04-15T00:00:06.000Z" },
    { name: "DTU钣金", role: "结构", products: "DTU设备相关", createdAt: "2026-04-15T00:00:07.000Z" },
    { name: "电缆附件规格", role: "所有", products: "电缆附件相关", createdAt: "2026-04-15T00:00:08.000Z" },
    { name: "其他", role: "所有", products: "环网柜、环网箱、配电箱、GCK、中置柜、GGD、DTU、环保柜、其他", createdAt: "2026-04-15T00:00:09.000Z" }
  ],

  // 双重确认配置
  configGroups: [
    {
      groupName: "隔离方式",
      items: [
        { name: "上隔离", type: "通用", mode: "二选一/多选一", productTypes: ["固体绝缘", "环保空气绝缘"] },
        { name: "下隔离", type: "通用", mode: "二选一/多选一", productTypes: ["固体绝缘", "环保空气绝缘"] }
      ]
    },
    {
      groupName: "抽屉方式",
      items: [
        { name: "固定式", type: "通用", mode: "二选一/多选一", productTypes: ["固体绝缘", "环保空气绝缘"] },
        { name: "抽屉式", type: "通用", mode: "二选一/多选一", productTypes: ["固体绝缘", "环保空气绝缘"] }
      ]
    }
  ],

  // 产品类型
  productTypes: [
    {
      name: "环网柜",
      expanded: true,
      children: [
        { name: "SF6绝缘" },
        { name: "固体绝缘" },
        { name: "环保空气绝缘" }
      ]
    },
    {
      name: "环网箱",
      expanded: true,
      children: [
        { name: "SF6绝缘" },
        { name: "固体绝缘" },
        { name: "环保空气绝缘" }
      ]
    },
    {
      name: "配电箱",
      expanded: false,
      children: [{ name: "标准型" }]
    },
    {
      name: "GCK",
      expanded: false,
      children: [{ name: "标准型" }]
    },
    {
      name: "中置柜",
      expanded: false,
      children: [{ name: "标准型" }]
    },
    {
      name: "GGD",
      expanded: false,
      children: [{ name: "标准型" }]
    },
    {
      name: "DTU",
      expanded: false,
      children: [{ name: "标准型" }]
    },
    {
      name: "环保柜",
      expanded: false,
      children: [{ name: "标准型" }]
    },
    {
      name: "其他",
      expanded: false,
      children: [{ name: "其他" }]
    }
  ]
};

// 导出预设数据（用于其他脚本引用）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PRESET_DATA;
}
