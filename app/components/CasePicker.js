import React, { Component } from 'react'
import { Modal, Button, Tag, Radio, List } from 'antd-mobile-rn';
import { StyleSheet, View,Text } from 'react-native';
import Super from './../super'
import Units from './../units'
const RadioItem = Radio.RadioItem;
const Item = List.Item

export default class CasePicker extends Component {

	state = {
		caseModal: false,
		caseList: "",
		changeselset: 0,
		stateRadioValue: "",
		changeTag: false,
		ikey: [],
		tagStr: []
	}
	showModal = (formList) => {
		const caseList = formList.value
		const optGroupId = formList.optionKey.split("@")[0]
		const num = formList.optionKey.split("@")[1]
		let {tagStr} = this.state
		if(caseList) {
			tagStr = Units.uniq(caseList.split("->"))
		}
		this.setState({
			caseModal: true,
			caseList,
			changeselset: 0,
			radiokey: "",
			num,
			stateRadioValue: "",
			tagStr,
		});
		this.getcaseList(optGroupId)
	}

	getcaseList = (optionKey) => {
		const {tokenName} =this.props
		const {ikey} = this.state
		if(typeof optionKey === "string") {
			ikey.push(parseInt(optionKey))
			this.setState({
				ikey
			})
		}
		Super.super({
			url: `/api/field/cas_ops/${optionKey}`,
		},tokenName).then((res) => {
			const ops = []
			res.options.map((item) => {
				const op = {
					value:item.title,
					label:item.title,
					key:item.id
				}
				ops.push(op)
				return false
			})
			this.setState({
				options: ops,
			})
		})
	}
	onChangeTag = (index, radiokey) => {
		const {stateRadioValue,ikey} = this.state
		const arr = stateRadioValue.split("->")
		const arr2 = []
		const keys = []
		const res = ""
		if(index > 0) { //点击tag.删除点击tag之后的数据
			for(const i = 0; i < index; i++) {
				arr2.push(arr[i])
			}
			res = arr2.join("->")
		}
		for(const i = 0; i <= index; i++) {
			keys.push(ikey[i])
		}
		this.getcaseList(radiokey)
		this.setState({
			changeselset: index,
			changeTag: true,
			stateRadioValue: res,
			ikey: keys
		})
	}
	onRadioChange = (radiokey, radiovalue) => {
		let {caseList,stateRadioValue,num,changeselset,ikey,tagStr} = this.state
		let changenum = changeselset
		const Num=Number.parseInt(num)
		if(stateRadioValue) {
			if(tagStr.length === Num) {
				const arr = stateRadioValue.split("->")
				arr.splice(Num - 1, 1, radiovalue)
				stateRadioValue = arr.join("->")
				caseList = stateRadioValue
				ikey.push(radiokey)
			} else {
				caseList = stateRadioValue + "->" + radiovalue
				stateRadioValue = stateRadioValue + "->" + radiovalue
				ikey.push(radiokey)
				changenum++
			}
		} else {
			caseList = radiovalue
			stateRadioValue = radiovalue
			ikey.push(radiokey)
			changenum++
		}
		if(caseList) {
			tagStr = Units.uniq(caseList.split("->"))
		}
		if(stateRadioValue.split("->").length < Num) {
			this.getcaseList(radiokey)
		} else if(stateRadioValue.split("->").length === Num) {
			ikey.splice(Num, 1, radiokey)
		}
		ikey = Units.uniq(ikey)
		this.setState({
			radiokey,
			stateRadioValue,
			caseList,
			changeselset: changenum,
			ikey,
			tagStr,
			changeTag: false
		});
	};
	onCloseCase = () => {
		const {caseList} = this.state
		this.props.formList.value = caseList //最后按确定键，将值传出
		this.triggerChange(caseList);
		this.onClose()
		this.setState({
			caseList: "",
			changeselset: 0,
			stateRadioValue: "",
			changeTag: false,
			ikey: [],
			tagStr: []
		})
	}
	triggerChange = (changedValue) => {
		const {onChange} = this.props
		if(onChange) {
			onChange(changedValue);
		}
	}
	onClose = () => {
		this.setState({
			caseModal: false,
		});
	}
	render() {
		const {formList} = this.props
		const {changeselset,caseModal,options,radiokey,changeTag,ikey,tagStr} = this.state
		const {value,title,fieldId} = formList
		return(
			<View>
				<Item extra={value?value:`请选择${title}`} arrow="horizontal" onPressIn={()=>this.showModal(formList)}>
					{title}
				</Item>
                <Modal
                    popup
                    visible={caseModal}
                    onClose={this.onClose}
                    animationType="slide-up"
                    afterClose={this.closeModal}
					maskClosable={true}
                    >
                    <List renderHeader={() => <Text style={styles.selectTitle}>{`请选择${title}`}</Text>}>
                    <List.Item>
                        <View style={styles.tagsBox}>
                            {tagStr.map((item,index)=>(
                                <Tag 
                                    selected={changeTag?(index===changeselset?true:false):false} //判断点击是否为当前
                                    onChange={() =>this.onChangeTag(index,ikey[index])} 
                                    key={index}
									disabled={index>changeselset?true:false}
									style={styles.tag}
                                    >
                                    {item}
                                </Tag>
                            ))}
                        </View>
                        </List.Item>
                        <View>
                            {options?options.map(i => (
                                <RadioItem key={i.key} checked={radiokey === i.key} onChange={() => this.onRadioChange(i.key,i.value)}>
                                    {i.label}
                                </RadioItem>
                            )):null}
                        </View>
                        <List.Item>
                            <Button type="primary" onClick={this.onCloseCase}>确定</Button>
                        </List.Item>
                    </List>
                </Modal>
            </View>
		)
	}
}
const styles = StyleSheet.create({    
    tagsBox:{
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center'
	},
	tag:{
		marginRight:10
	},
	selectTitle:{
		height:40,
		alignSelf:'center',
		paddingVertical: 10,
		fontSize: 16
	}
})