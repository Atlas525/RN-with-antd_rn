import React, {Component} from 'react'
import { DatePicker, List, InputItem,Badge } from 'antd-mobile-rn';
import {StyleSheet ,Text,View,TextInput } from 'react-native'
import ImgBox from './ImgBox'
import CasePicker from './CasePicker'
import MultiplePicker from './MultiplePicker'
import SelectPicker from './SelectPicker'
import Feather from 'react-native-vector-icons/Feather';
const Item = List.Item

const api='http://139.196.123.44/datacenter_api'
export default class FormCard extends Component {

	initFormList = () => {
		const {getFieldProps,formList,optionsMap,tokenName,index} = this.props

		if(formList) {
			const fieldName = formList.fieldName
			const fieldValue = formList.value
			const title = formList.title
			const fieldId = formList.fieldId
			const validators = formList.validators
			if(formList.type === "text") {
				return <InputItem
                            {...getFieldProps(fieldName,{
                                initialValue:fieldValue?fieldValue:"",
                                rules:validators?[{
                                    required: true, message: `请选择${title}`,
                                  }]:null,
                            })}
                            placeholder={`请输入${title}`}
                            key={fieldId}
                            editable={formList.available===false?false:true}
                            clear
                        >
							<Badge dot={formList.validators?true:false}>
								<Text style={{fontSize:17,color:'#010101'}}>
									{title}
								</Text>
							</Badge>
						</InputItem>
			} else if(formList.type === "select" || formList.type === "relation" || formList.type === "preselect" ) {
				if(optionsMap) {
					let optdata
					for(let k in optionsMap) {
						if(k.includes(formList.fieldId)===true) {
							optdata=optionsMap[k]
						}
					}
					if(optdata){
						for(let k in optdata){
							optdata[k]["label"]=optdata[k].title
						}
						return <SelectPicker 
									formList={formList}
									optdata={optdata}
									disabled={formList.available===false?true:false}
									{...getFieldProps(fieldName,{
										initialValue:fieldValue?fieldValue:"",
										rules:validators?[{
											required: true, message: `请选择${title}`,
										}]:null,
									})}
								>	
								<Item arrow="horizontal">
									<Badge dot={formList.validators?true:false}>
										<Text style={{fontSize:17,color:'#010101'}}>
											{title}
										</Text>
									</Badge>
									</Item>
								</SelectPicker>
					}
				}
			} else if(formList.type === "date") {
				let time = "";
				let time_date = ""
				if(fieldValue) { //字符串转化为时间格式
					time = fieldValue.replace(/-/g, "/");
					time_date = new Date(time)
				}
				return <DatePicker   
                            extra="请选择(可选)"
                            mode="date"
                            title={title}
                            key={fieldId}
                            {...getFieldProps(fieldName,{
                                initialValue:time_date,
                            })}
                            onOk={e => console.log('ok', e)}
                            onDismiss={e => console.log('dismiss', e)}
                        >
                            <Item arrow="horizontal">{title}</Item>
                        </DatePicker>
			} else if(formList.type === "caselect") {
				return <CasePicker
							formList={formList}
							tokenName={tokenName}
                            {...getFieldProps(fieldName,{
                                initialValue:fieldValue?fieldValue:"",
                            })}
                            />
			} else if(formList.type === "decimal" || formList.type === "int") {
				return <InputItem
                            {...getFieldProps(fieldName,{
                                initialValue:fieldValue?fieldValue:"",
                            })}
                            type={'number'}
                            defaultValue={fieldValue}
                            placeholder={`请输入${title}`}
                            key={fieldId}
                            clear
                        >
						<Badge dot={formList.validators?true:false}>
							<Text style={{fontSize:17,color:'#010101'}}>
								{title}
							</Text>
						</Badge>
					</InputItem>
			} else if(formList.type === "label") {
                if(optionsMap) {
					let optdata
					for(let k in optionsMap) {
						if(k.includes(formList.fieldId)===true) {
							optdata=optionsMap[k]
						}
					}
					if(optdata){
						for(let k in optdata){
							optdata[k]["label"]=optdata[k].title
						}
						return <MultiplePicker 
                                    formList={formList}
                                    optdata={optdata}
                                    {...getFieldProps(fieldName,{
                                        initialValue:fieldValue?fieldValue:"",
                                    })}
                                />
					}
				}
			}else if(formList.type === "file") {
				const files = fieldValue ? {
					uri: fieldValue.replace(".",api),//多了一个点
				}:null
				return <ImgBox 
							formList={formList}
							files={files}
							{...getFieldProps(fieldName)}
						/>                  
			}else if(formList.type === "onlycode") {
				return <TextInput 
                            {...getFieldProps(fieldName,{
                                initialValue:fieldValue?fieldValue:"",
							})}
							style={{height:0,margin:0,padding:0,}}
							/>
			} else if(formList.type === "deletebtn") {
				return <Item style={index!=0?styles.borderTop:null}>
							<View style={styles.delebtn}>
                            <Feather 
                                name="delete"
								onPress={this.props.deleteList}
								size={23}
                                />
							</View>
                        </Item >
			}else{
				return null
			}
		}
	}
	render() {
		return(<List>
           			{this.initFormList()}
		   		</List>
		)
	}
}
const styles = StyleSheet.create({    
	borderTop:{
		borderTopColor:'#F5F5F9',
		borderTopWidth:10
	},
	delebtn:{
		flex:1,
		flexDirection: 'row',
		justifyContent: 'flex-end',
	}
	
})