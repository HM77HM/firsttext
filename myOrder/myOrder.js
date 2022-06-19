//JS
const app = getApp()
const db = wx.cloud.database();
Page({
  data: {
    navbar: ["待收货", "待评价", "已完成", "已取消"],
    // 默认选中菜单
    currentTab: 0,
    orderStatus: 0, //-1订单取消,0新下单发货,1已收货待评价,2订单已完成
    list: []
  },
  //顶部tab切换
  navbarTap: function (e) {
    let index = e.currentTarget.dataset.idx;
    this.setData({
      currentTab: index,
      orderStatus: index == 3 ? -1 : index
    })
    this.getMyOrderList();
  },

  onShow: function () {
    this.getMyOrderList();
  },

  getMyOrderList() {
    wx.cloud.callFunction({
        name: 'getOrderList',
        data: {
          action: 'user',
          orderStatus: this.data.orderStatus
        }
      })
      .then(res => {
        console.log("我的订单列表", res)
        this.setData({
          list: res.result.data
        })
      }).catch(res => {
        console.log("我的订单列表失败", res)
      })
  },
  //去评论页面
  goCommentPage() {
    wx.navigateTo({
      url: '../myComment/myComment',
    })
  },
  // 去评论
  goComment(e) {
    wx.navigateTo({
      url: '/pages/comment/comment?id=' + e.currentTarget.dataset.item._id,
    })
  },


  //确认收货
  shouhuo(event) {
    let orderId = event.currentTarget.dataset.item._id;
    db.collection('order').doc(orderId).update({
      data: {
        status: 1
      }
    }).then(res => {
      console.log('确认收货成功', res)
      this.getMyOrderList()
      wx.showToast({
        title: '收货成功'
      })
    }).catch(res => {
      console.log('确认收货失败', res)
      wx.showToast({
        icon: 'none',
        title: '收货失败'
      })
    })
  },
  //取消订单
  cancleOrder(event) {
    let item = event.currentTarget.dataset.item
    let goods = [{
      _id: item.good._id,
      quantity: item.good.quantity
    }]
    db.collection('order').doc(item._id).update({
      data: {
        status: -1
      }
    }).then(res => {
      console.log('取消订单成功', res)
      //取消订单后把商品数量加回去
      wx.cloud.callFunction({
        name: "addXiaoLiang",
        data: {
          goods: goods
        }
      }).then(res => {
        console.log('添加商品数量成功', res)
        wx.showToast({
          title: '取消订单成功',
        })
        this.getMyOrderList()
      }).catch(res => {
        console.log('添加商品数量失败', res)
        wx.showToast({
          icon: 'none',
          title: '取消订单失败',
        })
      })

    }).catch(res => {
      console.log('取消订单失败', res)
      wx.showToast({
        icon: 'none',
        title: '取消订单失败',
      })
    })
  },
  // 给卖家打电话
  call(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone,
    })
  },
  //去商品详情页
  goDetail(e) {
    wx.navigateTo({
      url: '/pages/detail/detail?goodid=' + e.currentTarget.dataset.goodid
    })
  },
})