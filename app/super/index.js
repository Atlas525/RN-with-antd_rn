import {ToastAndroid } from 'react-native';
import superagent from 'superagent'
const api='http://139.196.123.44/datacenter_api'
const toast=(msg)=>{
	ToastAndroid.showWithGravity(msg, ToastAndroid.SHORT,ToastAndroid.CENTER);
}
export default class Superagent {	
	static super(options,tokenName,type) {
		let tet = "form"
		if(type === "json") {
			tet = "application/json"
		}
		return new Promise((resolve, reject) => {
			superagent
				.post(api+options.url)
				.type(tet)
				.set("datamobile-token", tokenName)
				.query(options.query || '')
				.send(options.data || '')
				.end((req, res) => {
					//console.log(res)
					if(res.status === 200) {
						resolve(res.body)
					} else if(res.status === 403) {
						toast("请求权限不足,可能是token已经超时")
					} else if(res.status === 404 || res.status === 504) {
						toast("服务器未开···")
					} else if(res.status === 500) {
						toast("后台处理错误。")
					} else {
						reject(res.body)
					}
			})
		})
	}
}