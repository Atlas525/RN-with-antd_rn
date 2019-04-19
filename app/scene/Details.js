import React, {Component} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Super from './../super'
import { createForm } from 'rc-form';
import FormCard from './../components/FormCard'
import { List,Toast } from 'antd-mobile-rn';
import {StyleSheet ,Text, ScrollView,View } from 'react-native'
import Popover,{ Rect } from 'react-native-popover-view'

const rect=new Rect(290, 0, 220, 40)
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
				let itemList = res.entity.fieldGroups
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
				let list = {}
				let li = {}
				let fields = []
				list["id"] = item.id
				list["title"] = "不可修改字段"
				li["title"] = item["fieldTitle"]
				li["type"] = "text"
				li["value"] = item["fieldValue"]
				li["available"] = false
				li["fieldName"] = item["fieldTitle"]
				fields.push(li)
				list["fields"] = fields
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
						const deletebtn = {}
						deletebtn["type"] = "deletebtn"
						deletebtn["deleteCode"] = `${totname}[${index}]`
						deletebtn["fieldName"] = `${totname}[${index}].deleteCode`
						re.push(deletebtn)
						//关系选项
						if(item.composite.addType === 5) {
							const relation = {}
							const relaOptions = []
							item.composite.relationSubdomain.map((item) => {
								const list = {}
								list["title"] = item
								list["value"] = item
								list["label"] = item
								relaOptions.push(list)
								return false
							})
							relation["fieldId"] = item.composite.id
							relation["type"] = "relation"
							relation["value"] = it.relation
							relation["title"] = "关系"
							relation["validators"] = "required"
							relation["fieldName"] = `${totname}[${index}].关系`
							relation["relationSubdomain"] = relaOptions
							optionsMap[`field_${item.composite.id}`] = relaOptions
							re.push(relation)
						}
						//唯一编码
						const onlycode = {}
						onlycode["type"] = "onlycode"
						onlycode["fieldName"] = `${totname}[${index}].code`
						onlycode["value"] = it.code
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
        fetch(`http://139.196.123.44/datacenter_api/api/field/options`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                "datamobile-token": tokenName
                // 'Content-Type': 'multipart/form-data',
            },
            processData: false,
            contentType: false,
            body: formData,
        }).then((response)=> {
            return response.json();
        }).then((data)=> {
            optionsMap=data.optionsMap
            this.reloadItemList(itemList, premises, optionsMap)
            this.setState({
                optionsMap
			})
			console.log(optionsMap)
        }).catch((e)=> {
            Toast.fail(e)
        });
	}
	popoverNav=(key)=>{
        const {searchList,tokenName,menuId}=this.state
        if(key===1){
            this.props.linkDrawer(searchList,tokenName)
        }else if(key===2){
            this.props.navigation.navigate('Details',{
                menuId,
                tokenName,
                title:'创建'
            })
        }else if(key===3){
            this.props.navigation.navigate('Home')
        }else if(key===4){
            this.props.navigation.navigate('Login')
        }else if(key===5){
            this.props.navigation.navigate('User')
        }
        this.setState({visible: false});
    }
    render(){
        const {itemList,tokenName,herderName,visibleNav,scrollIds,optionsMap,visiblePop} = this.state
        const {getFieldProps} = this.props.form;
        return (
            <ScrollView>
				<Popover
					fromRect={rect}
					onClose={()=>this.setState({visiblePop: false})}
					placement={'bottom'}
					popoverStyle={{width:100}}
					isVisible={visiblePop}>
					<View>
						<Text key={1} style={styles.Text} onPress={()=>this.popoverNav(1)}>
							<SimpleLineIcons name={"magnifier"} size={16}/>&nbsp;&nbsp;筛选
						</Text>
						<Text key={2} style={styles.Text} onPress={()=>this.popoverNav(2)}>
							<SimpleLineIcons name={"plus"} size={16}/>&nbsp;&nbsp;创建
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
                                    id = {item.title}	
                                    key = {`${item.id}[${i}]`}
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
																	onPress = {() => this.SelectTemplate.onOpenChange(item)} 
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
												deleteList = {(e) => this.showAlert(it.deleteCode, e)}
												tokenName={tokenName}
                                                />
                                    }) :null
                                }	 
                                </List>
                    })
                    } 
                    </View>
                </ScrollView> 
        )
    }
}
export default createForm()(Details);
const styles = StyleSheet.create({    
    headerRight:{
        color:'#fff',
        marginRight:18
    },
    headerLeft:{
        color:'#fff',
        marginLeft:18
    },
    listHeader:{
        height:60,
        backgroundColor:'#F5F5F9',
        flexDirection:'row',
        alignItems:'center',
        flex: 1,
        paddingHorizontal: 15
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
})