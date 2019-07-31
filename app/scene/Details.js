import React, {Component} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Feather from 'react-native-vector-icons/Feather';
import Super from './../super'
import Units from './../units'
import TemplateDrawer from './../components/TemplateDrawer'
import { createForm } from 'rc-form';
import FormCard from './../components/FormCard'
import { List,Toast,Modal,ActivityIndicator,Button } from 'antd-mobile-rn';
import {StyleSheet ,Text, ScrollView,View } from 'react-native'
import Popover,{ Rect } from 'react-native-popover-view'
const Alert = Modal.alert;

const rect=new Rect(290, 0, 220, 40)
const api='http://139.196.123.44/datacenter_api'
class Details extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
                title: navigation.getParam('title', 'A Nested Details Screen'),
                headerStyle: {
                    backgroundColor: '#2567EF',
                }, 
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerLeft: (
                    <View>
                        <SimpleLineIcons
                            name={'arrow-left'} 
                            size={20} 
                            style={styles.headerLeft}  
                            onPress={navigation.getParam('goBack')}/>
                    </View>
                  ),
                headerRight: (
                    <View>
                        <SimpleLineIcons
                            name={'options'} 
                            size={20} 
                            style={styles.headerRight}  
                            onPress={navigation.getParam('showPopover')}/>
                    </View>
                  ),
            }
      }
    state = {
		itemList: [],
		optionsMap:{},
		herderName: "",
		visibleNav: false,
        scrollIds: [],
		menuId:"",
		visiblePop:false,
	}
    componentWillMount(){
        const {menuId,code,tokenName} = this.props.navigation.state.params
        this.setState({menuId,code,tokenName})
    }
    componentDidMount(){
        this.loadRequest()
        this.props.navigation.setParams({ showPopover: this.showPopover });
        this.props.navigation.setParams({ goBack: this.goBack });
	}
	//显示下拉列表
    showPopover=()=> {
        this.setState({
            visiblePop: true,
        });
	}
	goBack=()=>{
        this.props.navigation.navigate('ItemList')
    }
    loadRequest = () => {
		const {menuId, code,tokenName}=this.state
		const URL = code ? `/api/entity/curd/detail/${menuId}/${code}` : `/api/entity/curd/dtmpl/${menuId}`
		Super.super({
			url: URL,
		},tokenName).then((res) => {
			if(res && res.entity) {
				const scrollIds = []
				const itemList = res.entity.fieldGroups
				itemList.map((item) => {
					scrollIds.push(item.title)
					return false
				})
				this.setState({
					herderName: res.entity.title,
					scrollIds,
				})
				const selectId = []
				res.entity.fieldGroups.map((item) => {
					if(item.fields) {
						item.fields.map((it) => { //基础信息里面的选择项
							if(it.type === "select" || it.type === "label" || it.type === "preselect") {
								selectId.push(it.fieldId)
							}
							return false
						})
					} else if(item.descs) {
						item.descs.map((it) => { //其他列表里面的选择项
							if(it.type === "select" || it.type === "label" || it.type === "preselect") {
								selectId.push(it.fieldId)
							}
							return false
						})
					}
					return false
				})
				if(selectId.length > 0) {
					this.requestSelect(selectId, itemList, res.premises)
				} else {
					this.reloadItemList(itemList, res.premises)
				}
			}
		})
    }
    reloadItemList = (itemList, premises, optionsMap) => {
		if(premises && premises.length > 0) { //判断有无不可修改字段
			const result = []
			let re = []
			premises.map((item) => {				
				const li = {
					title: item.fieldTitle,
					type:"text",
					value:item.fieldValue,
					available: false,
					fieldName:item.fieldTitle,
				}
				const fields = []
				fields.push(li)
				const list = {
					id:item.id,
					title:"不可修改字段",
					fields
				}
				result.push(list)
				re = fields
				return false
			})
			itemList.map((item) => {
				if(item.fields) {
					item.fields.map((it) => {
						re.map((i) => {
							if(it.fieldName === i.fieldName) {
								it.value = i.value
								it.available = false
							}
							return false
						})
						return false
					})
				}
				return false
			})
			itemList.unshift(...result)
		}
		const totalNameArr = []
		itemList.map((item) => {
			if(!item.fields) {
				let re = []
				if(item.array && item.array.length > 0) {
					item.array.map((it, index) => {
						item["i"] = index //加入计数array条数
						const totname = item.composite.name
						//删除按钮                                              
						const deletebtn = {
							type:"deletebtn",
							deleteCode:`${totname}[${index}]`,
							fieldName:`${totname}[${index}].deleteCode`,
						}
						re.push(deletebtn)
						//关系选项
						if(item.composite.addType === 5) {
							const relaOptions = []
							item.composite.relationSubdomain.map((item) => {
								const list = {
									title:item,
									value:item,
									label:item
								}
								relaOptions.push(list)
								return false
							})
							const relation = {
								fieldId:item.composite.id,
								type:"relation",
								value:it.relation,
								title:"关系",
								validators:"required",
								fieldName:`${totname}[${index}].关系`,
								relationSubdomain:relaOptions
							}
							re.push(relation)
						}
						//唯一编码
						const onlycode = {
							type:"onlycode",
							fieldName:`${totname}[${index}].code`,
							value:it.code
						}
						re.push(onlycode)
						//列表数据                             
						it.fields.map((e) => {
							const totname = e.fieldName.split(".")[0]
							const lasname = e.fieldName.split(".")[1]
							e.fieldName = `${totname}[${index}].${lasname}`
							return false
						})
						re.push(...it.fields)
						if(item.composite.addType) {
							totalNameArr.push(item.composite.name)
						}
						return false
					})
				}
				item["fields"] = re
			}
			return false
		})
		this.setState({
			itemList,
			optionsMap,
			totalNameArr,
		})
    }
    requestSelect = (selectId, itemList, premises) => {
		let optionsMap ={}
		const formData = new FormData();
		const {tokenName} = this.state
		selectId.map((item) => {
			formData.append('fieldIds', item);
			return false
        })
        fetch(api+`/api/field/options`, {
            method: 'POST',
            headers: {
                //'Accept': 'application/json',
                "datamobile-token": tokenName,
                'Content-Type': 'multipart/form-data',
            },
            processData: false,
            contentType: false,
            body: formData,
        }).then((response)=> {
			//console.log(response)
            return response.json();
        }).then((data)=> {
			//console.log(data)
            optionsMap=data.optionsMap
            this.reloadItemList(itemList, premises, optionsMap)
            this.setState({
                optionsMap
			})
        }).catch((e)=> {
            Toast.fail(e)
        });
	}
	popoverNav=(key)=>{
        if(key===1){
            this.handleSubmit()
        }else if(key===2){
			this.showNavModal()
        }else if(key===3){
            this.props.navigation.navigate('Home')
        }else if(key===4){
            this.props.navigation.navigate('Login')
        }else if(key===5){
            this.props.navigation.navigate('User')
        }
        this.setState({visiblePop: false});
	}
	addList = (index, data) => {
		let {itemList,optionsMap} = this.state
		const needList = itemList[index]
		const i = needList.i >= 0 ? (needList.i + 1) : 0
		const descs = []
		const totalNm = needList.composite.name
		//删除按钮                                              
		const deletebtn = {
			type:"deletebtn",
			deleteCode:`${totalNm}[${i}]`,
			fieldName: `${totalNm}[${i}].deleteCode`
		}
		descs.push(deletebtn)
		if(needList.composite.addType === 5) { //添加关系选择
			const composite = needList.composite
			const relaOptions = []
			composite.relationSubdomain.map((item) => {
				const list = {
					title:item,
					value:item,
					label:item
				}
				relaOptions.push(list)
				return false
			})
			const relation = {
				fieldId:composite.id,
				type:"relation",
				title:"关系",
				validators: "required",
				fieldName:`${totalNm}.关系`,
				relationSubdomain:relaOptions,
				value:composite.relationSubdomain.length===1?composite.relationSubdomain[0]:null
			}
			descs.push(relation)
			optionsMap[`field_${composite.id}`] = relaOptions
		}
		const onlycode = {
			type:"onlycode",
			fieldName:`${totalNm}.code`,
			value:data?data["唯一编码"]:null
		}
		descs.push(onlycode)

		descs.push(...needList.descs)
		const list = {
			i,
			id:needList.id,
			title:needList.title,
			composite: needList.composite,
			descs:needList.descs,
			stmplId:needList.stmplId?needList.stmplId:null
		}
		const arr = []
		descs.map((item) => {
			const lasname = item.fieldName.split(".")[1]
			const list = {}
			for(let k in item) {
				if(k === "fieldName") {
					list[k] = `${totalNm}[${i}].${lasname}`
				} else {
					list[k] = item[k]
				}
				if(data) { //从模板中赋值
					for(let e in data) {
						const itemN = item["fieldName"].split(".")[1]
						const dataN = e.split(".")[1]
						if(itemN === dataN) {
							list["value"] = data[e]
						}
					}
				}
			}
			arr.push(list)
			return false
		})
		const field = needList.fields
		if(field && field.length>0) { //有field,说明添加了1次以上
			field.push(...arr)
			list["fields"] = field
		} else {
			list["fields"] = arr
		}
		itemList.splice(index, 1, list)
		this.setState({
			itemList,
			optionsMap
		})
	}
	onRef = (ref) => {
		this.SelectTemplate = ref
	}
	loadTemplate = (entities, stmplId, tempcodes) => {
		const {itemList} = this.state
		if(tempcodes) {
			itemList.map((item, index) => {
				if(item.stmplId && item.stmplId === stmplId) {
					const codeArr = tempcodes.split(",")
					codeArr.map((it) => {
						this.addList(index, entities[it])
						return false
					})
				}
				return false
			})
		}
	}
	showAlert = (deleteCode) => {
		Alert('删除操作', '确认删除这条记录吗???', [
			{text: '取消'},
			{text: '确认',onPress: () => this.deleteList(deleteCode)},
		]);
	};	
	deleteList = (deleteCode) => {
		let {itemList} = this.state
		itemList.map((item) => {
			//if(item.composite) {
				item.fields = item.fields.filter((it) => it.fieldName.includes(deleteCode) === false)
			//}
			return false
		})
		this.setState({
			itemList
		})
	}
	madeValue=(values)=>{
		for(let k in values) {
			//name去除图片
			if(values[k] && typeof values[k] === "object" && !Array.isArray(values[k]) && !values[k].name) {
				values[k] = Units.dateToString(values[k])
			} else if(values[k] && typeof values[k] === "object" && Array.isArray(values[k])) {
				const totalName = k
				values[`${totalName}.$$flag$$`] = true
				values[k].map((item, index) => {
					for(let e in item) {
						if(e === "关系") {
							e = "$$label$$"
							values[`${totalName}[${index}].${e}`] = item["关系"]
						} else if(e.includes("code") ===true ) {
							if(item[e]) {
								values[`${totalName}[${index}].唯一编码`] = item[e]
							} else {
								delete item[e]
							}
						} else if(item[e] === undefined) {
							delete item[e] //删除未更改的图片数据
						} else {
							values[`${totalName}[${index}].${e}`] = item[e]
						}
					}
					return false
				})
				delete values[k] //删除原始的对象数据
			} else if(values[k] === undefined) {
				delete values[k] //删除未更改的图片数据(基本信息)
			}
		}
		return values
	}
	handleSubmit = () => {
		const {code,totalNameArr,tokenName,menuId} = this.state //整个记录的code
		this.props.form.validateFields({force: true}, (err, values) => { //提交再次验证
			this.madeValue(values) //处理数据
			totalNameArr.map((item) => {
				values[`${item}.$$flag$$`] = true
				return false
			})
			console.log(values)
			if(!err) {
				const formData = new FormData();
				if(code){
					formData.append('唯一编码', code);
				}
				for(let k in values) {
					if(values[k]){
						formData.append(k, values[k])
					}
				}
				fetch(api+`/api/entity/curd/update/${menuId}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'multipart/form-data',
						"datamobile-token": tokenName,
					},
					body: formData,
				}).then((response)=> {
					console.log(response)
					return response.json()
				}).then((data)=> {
					console.log(data)
					this.setState({visiblePop: false})
					if(data.status==='suc'){
						Toast.info("保存成功！")
						this.props.navigation.goBack()
					}else{
						Toast.fail(data.status)
					}
				}).catch((e)=> {
					Toast.fail(e)
				});
			} else {
				this.setState({visiblePop: false});
				Toast.fail("必填选项未填！！")
			}
		})
	}
	showNavModal = () => {
		this.setState({
			visibleNav: true
		})
	}
	onClose = () => {
		this.setState({
			visibleNav: false
		})
	}
	scrollToAnchor = (i) => { //导航
		this.setState({
			visibleNav: false
		})
		this.myScrollView.scrollTo({ x:0, y: this[`layoutY`+i], animated: true});
	}
    render(){
        const {itemList,tokenName,visibleNav,scrollIds,optionsMap,visiblePop,menuId} = this.state
        const {getFieldProps} = this.props.form;
        return (
			<TemplateDrawer
				onRef = {this.onRef}
				menuId = {menuId}
				loadTemplate = {this.loadTemplate}
				tokenName={tokenName}
				>
				<ScrollView ref={(view) => { this.myScrollView = view; }}>
				<Popover
					fromRect={rect}
					onClose={()=>this.setState({visiblePop: false})}
					placement={'bottom'}
					popoverStyle={{width:100}}
					isVisible={visiblePop}>
					<View>
						<Text key={1} style={styles.Text} onPress={()=>this.popoverNav(1)}>
							<Feather name={"save"} size={16}/>&nbsp;&nbsp;保存
						</Text>
						<Text key={2} style={styles.Text} onPress={()=>this.popoverNav(2)}>
							<Feather name={"navigation"} size={16}/>&nbsp;&nbsp;导航
						</Text>
						<Text key={3} style={styles.Text} onPress={()=>this.popoverNav(3)}>
							<SimpleLineIcons name={"home"} size={16}/>&nbsp;&nbsp;首页
						</Text>
						<Text key={4} style={styles.Text} onPress={()=>this.popoverNav(4)}>
							<SimpleLineIcons name={"logout"} size={16}/>&nbsp;&nbsp;退出
						</Text>                    
						<Text key={5} style={styles.Text} onPress={()=>this.popoverNav(5)}>
							<SimpleLineIcons name={"user"} size={16}/>&nbsp;&nbsp;用户
						</Text>
					</View>
				</Popover>
                <View>
                    {itemList.map((item, i) => {
                        return <List	
									key = {`${item.id}[${i}]`}
									onLayout={e=>this[`layoutY`+i] = e.nativeEvent.layout.y}
                                    renderHeader = {() =><View style={styles.listHeader}>
                                                            <Text style={styles.listHeaderText}>{item.title}</Text>
                                                            {item.composite ?
                                                            <View style={styles.icons}>
                                                                <AntDesign 
                                                                    onPress = {() => this.addList(i)} 
                                                                    name={'addfolder'} 
                                                                    size={22}/>
                                                                {item.stmplId ? 
																<AntDesign
																	onPress = {() => this.SelectTemplate.onOpen(item)} 
																	name={'copy1'}
																	style={{marginLeft:15}}
																	size={22}/>:null
                                                                }
                                                            </View>:null}                                                       
                                                        </View>}
                                >
                                {item.fields ? item.fields.map((it, index) => {
                                    return <FormCard
                                                key = {`${it.fieldId}[${index}]`}
                                                formList = {it}
                                                getFieldProps = {getFieldProps}
                                                optionKey = {it.optionKey}
                                                optionsMap = {optionsMap}
												deleteList = {() => this.showAlert(it.deleteCode)}
												tokenName={tokenName}
												index={index}
                                                />
                                    }) :null
                                }	 
                                </List>
                    })
                    } 
					{itemList.length>0?<Text style={{textAlign:'center',marginTop:20}}>到底了...</Text>:<ActivityIndicator text="加载中..."/>}
                    </View>
                </ScrollView> 
				<Modal
					popup
					title={<Text>dsfds</Text>}
					visible = {visibleNav}
					onPressIn = {()=>console.log(99)}
					animationType = "slide-up" >
					<List renderHeader = {() => <Text style={styles.navHeaderText}> 请选择 </Text>}> 
						{scrollIds.map((i, index) => ( 
							<List.Item style={styles.navList} key={index} onPressIn={()=>this.scrollToAnchor(index)}> 
								<Text>{i}</Text>
							</List.Item>))
						} 
						<List.Item>
							<Button onPressIn = {this.onClose} > 取消 </Button> 
						</List.Item> 
					</List> 
				</Modal> 
			</TemplateDrawer>
            
        )
    }
}
export default createForm()(Details);
const styles = StyleSheet.create({    
    headerRight:{
        color:'#fff',
		marginRight:18,
    },
    headerLeft:{
        color:'#fff',
        marginLeft:18,
    },
    listHeader:{
        height:50,
        backgroundColor:'#F5F5F9',
        flexDirection:'row',
        alignItems:'center',
        flex: 1,
		paddingHorizontal: 12,
		borderWidth:0,
    },
    listHeaderText:{
        fontSize: 18,
    },
    icons:{
        flex:1,
        flexDirection:'row',
        justifyContent:"flex-end"
	},
	Text:{
        paddingLeft:0,
        textAlign: 'center',
        lineHeight:40,
        fontSize: 18
	},
	navList:{
		height:40,
		borderBottomWidth:1,
		borderColor:'#F5F5F9',
	},
	navHeaderText:{
		height:40,
		paddingVertical: 10,
		textAlign:'center',
        backgroundColor:'#F5F5F9',
	}
})