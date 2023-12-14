/* eslint-disable @typescript-eslint/no-unused-expressions */

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */

export default function access(initialState: { currentUser?: API.CurrentUser | undefined, resourceTreeList: any}) {
  const permissionIdList: string[] = [];

  const { currentUser, resourceTreeList } = initialState || {};
  const sysResources = currentUser?.grantedRoles;

  if(sysResources && sysResources.length > 0){
    currentUser?.grantedRoles.map((itemRole)=>{
      if(itemRole.sysResources){
        itemRole.sysResources.forEach((value)=>{
          if(!permissionIdList.includes(value.id)){
             permissionIdList.push(value.id);
          }
        })
      }
    })
  }

  const convertToPermissionDic = (obj) => {    
   if(obj && obj.length > 0){
    return Object.keys(obj).reduce((result, key) => {
      // const name = JSON.parse(obj[key].name)['en-US'].replace(/ +/g, '');
      const name = obj[key].defaultName.replace(/ +/g, '');

      result[name] = obj[key].children && obj[key].children.length > 0 ? convertToPermissionDic(obj[key].children) : permissionIdList.includes(obj[key].id);

      return result;
    }, {});
   }
   return;
  }


  const accessPermissionList =  convertToPermissionDic(resourceTreeList);
  // console.log("accessPermissionList", accessPermissionList);
  return accessPermissionList;
}
