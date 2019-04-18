

export default {
	formateDate(time) {
		if(!time) return '';
		const date = new Date(time);
		return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
	},
	dateToString(date) { //日期转字符串
		let year = date.getFullYear();
		let month = (date.getMonth() + 1).toString();
		let day = (date.getDate()).toString();
		if(month.length === 1) {
			month = "0" + month;
		}
		if(day.length === 1) {
			day = "0" + day;
		}
		const dateTime = year + "-" + month + "-" + day;
		return dateTime;
	},
	uniq(array) { //去重
		var temp = [];
		var index = [];
		var l = array.length;
		for(var i = 0; i < l; i++) {
			for(var j = i + 1; j < l; j++) {
				if(array[i] === array[j]) {
					i++;
					j = i;
				}
			}
			temp.push(array[i]);
			index.push(i);
		}
		return temp;
	},
	//随机数
	RndNum(n) {
		let rnd = "";
		for(let i = 0; i < n; i++)
			rnd += Math.floor(Math.random() * 10);
		return rnd;
	},
	queryParams(data, isPrefix = false) {
		let prefix = isPrefix ? '?' : ''
		let _result = []
		for(let key in data) {
			let value = data[key]
			// 去掉为空的参数
			if(['', undefined, null].includes(value)) {
				continue
			}
			if(value.constructor === Array) {
				value.forEach(_value => {
					_result.push(encodeURI(key) + '[]=' + encodeURI(_value))
				})
			} else {
				const str = encodeURI(key).replace("criteria", "c")
				_result.push(str + '=' + encodeURI(value))
			}
		}

		return _result.length ? prefix + _result.join('&') : ''
	},
	urlToObj(str) {
		let obj = {};
		const arr1 = str.split("?");
		const arr2 = arr1[1].split("&");
		for(let i = 0; i < arr2.length; i++) {
			const res = arr2[i].split("=");
			const str = res[0].replace("c", "criteria")
			obj[str] = res[1];
		}
		return obj;
	},
}