import React, { Component } from 'react';
import { Button, Checkbox, Drawer, List, Toast } from 'antd-mobile-rn';
import {StyleSheet ,Text, ScrollView,View } from 'react-native'
import Super from './../super';
const CheckboxItem = Checkbox.CheckboxItem;

export default class TemplateDrawer extends Component {

	componentDidMount() {
		this.props.onRef(this)
	}
	state = {
		checkboxdata: [],
		fieldWords: "",
		showDrawer: false,
		templateData: {},
	}
	onOpen=(item)=>{
		const {menuId,tokenName} = this.props
		const stmplId = item.stmplId
		let {fieldWords,showDrawer} = this.state
		let newfields = ""
		if(item.descs) { //获取字段名称
			item.descs.map((item) => {
				newfields += item.fieldName + ","
				return false
			})
			if(!fieldWords) {
				fieldWords = newfields
			}
			if(fieldWords && fieldWords !== newfields) {
				fieldWords = newfields
			}
		}
		let excepts = ""
		if(item.fields && item.fields.length > 0) { //获取排除的code
			item.fields.map((item) => {
				if(item.type === "onlycode") { //唯一编码
					excepts += item.value + ","
				}
				return false
			})
		}
		Super.super({
			url: `/api/entity/curd/selections/${menuId}/${stmplId}`,
			data: {
				pageNo: 1,
				excepts
			}
		},tokenName).then((res) => {
			this.setState({
				templateData: res,
				showDrawer: !showDrawer,
				stmplId,
				pageInfo: res.pageInfo,
				excepts,
				fieldWords,
				menuId,
				tokenName,
			})
		})
	}
	onOpenChange = isOpen => {
		this.setState({
			showDrawer:isOpen,
		})
	}
	close=()=>{
		this.setState({
			showDrawer:false,
		})
	}
	handleDrawerOk = () => {
		const {checkboxdata,fieldWords,stmplId,menuId,tokenName} = this.state
		const codes = checkboxdata.join(",")
		Super.super({
			url: `/api/entity/curd/load_entities/${menuId}/${stmplId}`,
			data: {
				codes,
				fields: fieldWords,
			}
		},tokenName).then((res) => {
			if(res.status === "suc") {
				this.props.loadTemplate(res.entities, stmplId, codes)
				this.setState({
					showDrawer: false,
				})
			} else {
				Toast.error(res.status)
			}
		})
	}
	changeCheckbox = (value) => {
		const {checkboxdata,} = this.state
		if(checkboxdata.length === 0) {
			checkboxdata.push(value)
		} else {
			let flag = -1
			checkboxdata.map((item, index) => {
				if(item === value) {
					flag = index
				}
				return false
			})
			if(flag !== -1) {
				checkboxdata.splice(flag, 1)
			} else {
				checkboxdata.push(value)
			}
		}
		this.setState({
			checkboxdata,
		})
	}
	goPage = (no) => {
		const {pageInfo,menuId,stmplId,excepts,tokenName} = this.state
		let data = {}
		const topageNo = pageInfo.pageNo + no
		data["pageNo"] = topageNo
		data["pageSize"] = pageInfo.pageSize
		data["excepts"] = excepts
		Super.super({
			url: `/api/entity/curd/selections/${menuId}/${stmplId}`,
			data: data
		},tokenName).then((res) => {
			this.setState({
				templateData: res,
				showDrawer: true,
				pageInfo: res.pageInfo
			})
		})
	}
	render() {
		const {showDrawer,pageInfo,templateData} = this.state
		const drawerData = templateData.entities
		const totalPage = pageInfo ? Math.ceil(pageInfo.count / pageInfo.pageSize) : null
		let sidebar = (<View>
                        <View>
                            <Text>{pageInfo?`第${pageInfo.pageNo}页，共${pageInfo.count}条`:null}</Text>
                            <Button type="warning" inline size="small" onPressIn={this.close}>取消</Button>
                            <Button type="primary" inline size="small" onPressIn={this.handleDrawerOk}>确定</Button>
                        </View>
                        {
                            drawerData?drawerData.map((item,index)=>{
                                return  <List key={item.code}>
                                            <CheckboxItem 
                                            onChange={() => this.changeCheckbox(item.code)}
                                            >
                                            {
                                                item.fields.map((it)=>{
                                                    return <List.Item.Brief inline key={it.id}>{it.title}&nbsp;:&nbsp;{it.value}</List.Item.Brief>                                              
                                                })
                                            }
                                            </CheckboxItem>
                                        </List>
                            }):null
                        }
                        {pageInfo&&totalPage>=(pageInfo.pageNo+1)?
                        <Button onPress={()=>this.goPage(+1)}>点击加载下一页</Button>:
                        <Text>没有更多了···</Text>}
                    </View>)
		return(
			<Drawer
                contentStyle={{ color: '#A6A6A6', textAlign: 'center', paddingTop: 42 }}
                sidebar={sidebar}
                open={showDrawer}
                position="right"
                touch={false}
                enableDragHandle
                onOpenChange={this.onOpenChange}
            >
				{this.props.children}
			</Drawer>
		)
	}
}