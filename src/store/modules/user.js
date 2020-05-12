import {login, getInfo, logout} from "../../api/user"
import {getToken, setToken, removeToken} from "../../utils/token"

function clearCommit(commit) {
  commit('SET_NAME', '');
  commit('SET_AVATAR', '');
  commit('SET_MENUS', '');
  commit('SET_PERMISSIONS', '');
  commit('SET_TOKEN', '');
  removeToken();
}

//for login success setting
const state = {
  token: getToken(),
  name: '',
  avatar: '',
  menus: [],
  permissions: []
};
const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_MENUS: (state, menus) => {
    state.menus = menus
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
  }
};

const actions = {
  // user login
  login({commit}, userInfo) {
    const {username, password} = userInfo;

    return new Promise((resolve, reject) => {
      login({username: username.trim(), password: password.trim()}).then(response => {
        //解析响应数据
        const {data} = response;
        if (data.token) { //此处data.token 根据实际情况修改
          setToken(data.token);
          commit('SET_TOKEN', data.token)
        }
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({commit, state}) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const {data} = response;
        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const {name, avatar, permissions, menus} = data;
        if (!menus || menus.length <= 0) {
          reject('menus must be a non-null array!')
        }
        if (!permissions || permissions.length <= 0) {
          reject('permissions must be a non-null array!')
        }

        commit('SET_NAME', name);
        commit('SET_AVATAR', avatar);
        commit('SET_MENUS', menus);
        commit('SET_PERMISSIONS', permissions);

        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({commit, state, dispatch}) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {

        clearCommit(commit);
        dispatch('login', null, {root: true});

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }

};

export default {
  namespaced: true,
  state,
  mutations,
  actions
}