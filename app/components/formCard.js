import React, {Component} from 'react'
import { DatePicker, List, InputItem,Picker,Badge } from 'antd-mobile-rn';
import {StyleSheet ,Text, ScrollView,View } from 'react-native'
import ImgBox from './ImgBox'
import CasePicker from './CasePicker'
import MultiplePicker from './MultiplePicker'
const Item = List.Item

export default class FormCard extends Component {

	initFormList = () => {
		const {getFieldProps,formList,optionsMap,tokenName} = this.props

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
                                  }]:"",
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
					let opArr=[]
					for(let k in optionsMap) {
						if(k.indexOf(formList.fieldId) > -1) {
							optdata=optionsMap[k]
						}
					}
					if(optdata){
						for(let k in optdata){
							optdata[k]["label"]=optdata[k].title
							opArr.push(optdata[k])
						}
						return <Picker
									data={opArr}
									cols={1}
									{...getFieldProps(fieldName)}
									title={`请选择${title}`}>
									<List.Item arrow="horizontal">
										{title}
									</List.Item>
								</Picker>
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
                            title={`请选择${title}`}
                            key={fieldId}
                            {...getFieldProps(fieldName,{
                                initialValue:time_date,
                            })}
                            onOk={e => console.log('ok', e)}
                            onDismiss={e => console.log('dismiss', e)}
                        >
                            <List.Item arrow="horizontal">{title}</List.Item>
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
                        >{title}</InputItem>
			} else if(formList.type === "label") {
                if(optionsMap) {
					let optdata
					let opArr=[]
					for(let k in optionsMap) {
						if(k.indexOf(formList.fieldId) > -1) {
							optdata=optionsMap[k]
						}
					}
					if(optdata){
						for(let k in optdata){
							optdata[k]["label"]=optdata[k].title
							opArr.push(optdata[k])
						}
						return <MultiplePicker 
                                    formList={formList}
                                    opArr={opArr}
                                    {...getFieldProps(fieldName,{
                                        initialValue:fieldValue?fieldValue:"",
                                    })}
                                />
					}
				}
			} else if(formList.type === "file") {
				const files = fieldValue ? [{
					url: `/file-server/${fieldValue}`,
					id: fieldId,
				}] :null
				return <ImgBox 
							formList={formList}
							files={files}
							{...getFieldProps(fieldName)}
						/>                  
			} else if(formList.type === "onlycode") {
				return <input
                            {...getFieldProps(fieldName,{
                                initialValue:fieldValue?fieldValue:"",
                            })}
                            type="hidden"
                        />
			} else if(formList.type === "deletebtn") {
				// return <p className="deteleLine">
                //             <span 
                //                 className="iconfont" 
                //                 style={{float:"right",top:"0"}}
                //                 onClick={this.props.deleteList}
                //                 >&#xe676;</span>
                //         </p>
			}else{
				return null
			}
		}
	}
	render() {
		return(
            <Item style={{height:45,}}>
                {this.initFormList()}                
            </Item>
		)
	}
}