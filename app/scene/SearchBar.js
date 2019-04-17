import React, {Component} from 'react';
import Super from "./../super"
import {DeviceEventEmitter,StyleSheet,ScrollView,View } from 'react-native';
import { createForm } from 'rc-form';
import SearchCard from './../components/searchCard'
import {List,InputItem,Button } from "antd-mobile-rn";
const Item =List.Item

class SearchForm extends Component {
    componentDidMount(){
        //console.log(this.props.navigation)
    }
    submit = () => {
		this.props.form.validateFields((err, values) => { //提交再次验证
			// for(let k in values) {
			// 	if(typeof values[k] === "object" && Array.isArray(values[k]) === false) {
			// 		console.log(values[k])
			// 		values[k] = Units.dateToString(values[k])
			// 	}
			// }
			console.log(values)  
			//this.props.handleSearch(values)
		})
	}
    reset = () => {
		this.props.form.resetFields('')
        console.log(this.props.form) 
	}
    render(){
        const {getFieldProps} = this.props.form;
        const {searchList,optionsMap} = this.props
        //console.log(searchList)
        return (
            <ScrollView>
                <List renderHeader={'查询条件'}>
                    {searchList.map((item)=>{
                        return  <SearchCard 
                                    key={item.id} 
                                    formList={item}
                                    optionsMap={optionsMap}
                                    getFieldProps={getFieldProps}
                                />
                    })}
                </List>
                <List renderHeader={'页码'}>
                    <Item> 
                        <InputItem
                            {...getFieldProps('pageNo')}
                            placeholder={`请输入页码`}
                            min={0}
                            type="number"
							clear
                        >页码</InputItem>            
                    </Item>
                    <Item>
                        <InputItem
                            {...getFieldProps('pageSize')}
                            placeholder={`请输入每页显示条数`}
                            min={0}
                            type="number"
							clear
                        >每页条数</InputItem>            
                    </Item>
                </List>
                 <View style={styles.btn}>
                    <Button type="warning" style={{width:'40%',marginRight:10}} onPressIn={this.reset}>重置</Button>
                    <Button type="primary" style={{width:'40%'}} onPressIn={this.submit}>查询</Button>
                 </View>
                </ScrollView>
        )
    }
}
export default createForm()(SearchForm);

const styles = StyleSheet.create({
    btn:{
        flexDirection:'row',
        justifyContent:'center',
        paddingTop:30
    },

})