import View from './components/view'
import Link from './components/link'

export let _Vue


/**
 * 注册方法
 * 在 vue 中注入 $router 和 $route
 * 全局暴露 router-view 和 router-link
 *  */
export function install (Vue) {

  // 使用函数实例限制只能注册一次。
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  /* 注册组件，实现在view.js中 */
  const registerInstance = (vm, callVal) => {
    // vm.$options是当前 Vue 实例的初始化选项
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  /* 全局注册一个混入，影响注册之后所有创建的每个 Vue 实例。 */
  Vue.mixin({
    beforeCreate () {

      /* 根实例对象才有 router option */
      if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        // 
        this._router.init(this)
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }

      /*  */
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  /* 
    定义路由器对象
    {
      afterHooks, app, apps, beforeHooks, fallback, history, matcher, mode, options, resolveHooks, currentRoute
    }  
  */
  
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  /* 
    定义当前路由对象
    {
      fullPath, hash, matched, meta, name, params, path, query
    }
  */
  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  /* 注册全局组件。暴露 router-view 和 router-link */
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  /* 自定义合并策略的选项 */
  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
