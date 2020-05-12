import {fixedRoute, asyncRoutes} from '../../router'

const state = {
  routes: [],
  addRoutes: []
};

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes;
    state.routes = fixedRoute.concat(routes);
  }
};

function hasMenu(menus, route) {
  if (!route.meta) {
    return true;
  }

  return menus.some(menu => route.path === menu);
}

export function filterAsyncRoutes(routes, menus) {
  let res = [];

  routes.forEach(route => {
    let tmp = {...route};
    if (hasMenu(menus, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, menus)
      }
      res.push(tmp)
    }
  });

  return res
}

const actions = {
  generateRoutes({commit}, menus) {
    return new Promise(resolve => {
      let authorizeRoutes;
      authorizeRoutes = filterAsyncRoutes(asyncRoutes, menus);
      commit('SET_ROUTES', authorizeRoutes);
      resolve(authorizeRoutes)
    })
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
}