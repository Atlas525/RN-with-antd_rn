import React, {Component} from 'react'
import { DatePicker, List, Picker,InputItem } from 'antd-mobile-rn';
const Item =List.Item

export default class SearchCard extends Component {

	state = {
		optdata: [],
		selected:'',
	}
	initFormList = () => {
		const {formList,optionsMap,getFieldProps,tokenName} = this.props
		if(formList) {
			const title = formList.title
			const fieldId = formList.fieldId
			const field = `criteria_${formList.id}`;
			if(formList.inputType === "text") {
				return <InputItem
                            {...getFieldProps(field)}
                            placeholder={`请输入${title}`}
							key={fieldId}
							clear
                        >{title}</InputItem>
			} else if(formList.inputType === "select") {
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
						return <Picker
									data={optdata}
									cols={1}
									value={this.state.selected}
									onChange={(item, index) => this.setState({selected: item.value})}
									{...getFieldProps(field)}
									title={`请选择${title}`}
									clear
								>
									<List.Item arrow="horizontal">
										{title}
									</List.Item>
								</Picker>
					}
				}
			} else if(formList.inputType === "date") {
				return <DatePicker
							key={fieldId}
							mode="date"
							onChange={this.onChange}
							format="YYYY-MM-DD"
							{...getFieldProps(field)}
							title={`请选择${title}`}
                        ><List.Item arrow="horizontal">{title}</List.Item></DatePicker>
			}else if(formList.inputType === "caselect") {
				return <CasePicker
							formList={formList}
							tokenName={tokenName}
							{...getFieldProps(field)}
							/>
			}else if(formList.inputType === "decimal" || formList.inputType === "int") {
				return <InputItem
                            {...getFieldProps(field)}
                            placeholder={`请输入${title}`}
							key={fieldId}
							min={0}
							type="number"
							clear
                        >{title}</InputItem>
			}
		}
	}
	render() {
		return(
			<Item style={{height:45}}>
                {this.initFormList()}                
            </Item>
		)
	}
}
