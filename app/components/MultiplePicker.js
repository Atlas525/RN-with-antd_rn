import React, {Component} from 'react'
import { Modal, Button, Checkbox, Picker, List } from 'antd-mobile-rn';
import { DeviceEventEmitter,StyleSheet,ToastAndroid ,Text, ScrollView,View } from 'react-native'
const CheckboxItem = Checkbox.CheckboxItem;
const Item = List.Item

export default class MultiplePicker extends Component {

	state = {
		vismodal: false,
	}
	showModal =() => {
		const {optdata,formList} = this.props
		const {value} = formList
		optdata.map((item) => {
			item["checked"] = false
			return false
		})
		if(value) {
			const arrvalue = value.split(",")
			optdata.map((item) => {
				arrvalue.map((it) => {
					if(item.value === it) {
						item["checked"] = true
					}
					return false
				})
				return false
			})
		}
		this.setState({
			optdata,
			vismodal: true,
		})
	}
	onClose = () => {
		this.setState({
			vismodal: false,
		});
	}
	onCloseMul = () => {
		const {optdata} = this.state
		let {formList} = this.props
		const res = []
		optdata.map((item) => {
			if(item.checked) {
				res.push(item.value)
			}
			return false
		})
		formList.value = res.join(",")
		this.triggerChange(formList.value);
		this.setState({
			vismodal: false,
		});
	}
	triggerChange = (changedValue) => {
		const onChange = this.props.onChange;
		if(onChange) {
			onChange(changedValue);
		}
	}
	onChange = (value) => {
		const {optdata} = this.state
		optdata.map((item) => {
			if(item.value === value) {
				item.checked = !item.checked
			}
			return false
		})
		this.setState({
			optdata
		})
	}
	render() {
		const {formList} = this.props
		const {optdata,vismodal} = this.state
		const {title,value} = formList
		return(
			<View>
				<Item extra={value?value:`请选择${title}`} arrow="horizontal" onPressIn={this.showModal}>
					{title}
				</Item>
                <Modal
                    popup
                    visible={vismodal}
                    onClose={this.onClose}
					animationType="slide-up"
					maskClosable={true}
                    >
					<List 
						renderHeader={() => <Text style={styles.selectTitle}>{`请选择${title}`}</Text>}
					>
                        <View>
                            {optdata?optdata.map(i => (
                                <CheckboxItem  
                                    key={i.label} 
                                    onChange={() => this.onChange(i.value)} 
                                    defaultChecked={i.checked}
                                    >
                                    {i.label}
                                </CheckboxItem>
                            )):null}
                        </View>
                        <List.Item>
                            <Button type="primary" onClick={this.onCloseMul}>确定</Button>
                        </List.Item>
                    </List>
                </Modal>
            </View>
		)
	}
}
const styles = StyleSheet.create({    
    selectTitle:{
		height:40,
		alignSelf:'center',
		paddingVertical: 10,
		fontSize: 16
	}
})