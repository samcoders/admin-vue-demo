import Vue from 'vue';
import Router from 'vue-router';
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import Layout from '../layout'
import i18n from '../lang'
import {getToken} from '../utils/token'
import store from '../store'
import {Message} from 'element-ui'

Vue.use(Router);
NProgress.configure({showSpinner: false});
const app_title = i18n.t('app.name');
const whiteList = ['/login'];

// 2. 定义路由
// 每个路由应该映射一个组件。
export const fixedRoute = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('../view/dashboard'),
        meta: {title: 'dashboard', icon: 'dashboard', affix: true}
      }
    ]
  },

  {
    path: '/documentation',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('../view/test'),
        name: 'Documentation',
        meta: {title: 'documentation', icon: 'documentation'}
      }
    ]
  },

  {
    name: 'login',
    path: '/login',
    component: () => import('../view/login'),
    hidden: true
  },

  {
    name: '404',
    path: '/404',
    component: () => import('../view/404'),
    hidden: true
  },

  //通配符路由放最后
  {
    path: '*', //通常用于404错误
    redirect: '/404' //重定向
  }
];

/*Routes requiring permission verification*/
export const asyncRoutes = [];

// add route path
/*routes.forEach(route => {
  route.path = route.path || '/' + (route.name || '');
});*/

// 3. 创建 router 实例，然后传 `routes` 配置
// 你还可以传别的配置参数, 不过先这么简单着吧。
const router = new Router({
  routes: fixedRoute // (缩写) 相当于 routes: routes
});

router.beforeEach(async (to, from, next) => {
  NProgress.start();

  /*get page title*/
  let title = to.meta && to.meta.title;
  if (title) {
    let hasTitle = i18n.te(`router.${title}`);
    if (hasTitle) {
      title = i18n.t(`router.${title}`);
      title = `${title} - ${app_title}`
    }

    document.title = title;
  }

  /*permission check*/
  let token = getToken();
  if (token) {
    /*has token*/
    if (to.path === '/login') {
      next({path: '/'});
      NProgress.done()
    } else {

      const permissions = store.getters.permissions && store.getters.permissions.length > 0;
      if (permissions) {
        next()
      } else {
        try {
          const {menus} = await store.dispatch('user/getInfo');
          const accessRoutes = await store.dispatch('permission/generateRoutes', menus);
          router.addRoutes(accessRoutes);

          next({...to, replace: true})
        } catch (error) {
          await store.dispatch('user/resetToken');
          Message.error(error || 'Has Error');
          next(`/login?redirect=${to.path}`);
          NProgress.done()
        }
      }

    }
  } else {
    /*no token*/
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`);
      NProgress.done()
    }
  }
});

router.afterEach(() => {
  NProgress.done()
});

export default router;