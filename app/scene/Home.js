import React, {Component} from 'react';
import Super from "./../super"
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { DeviceEventEmitter,StyleSheet,ToastAndroid ,Text, View, } from 'react-native';
import { Accordion, List } from 'antd-mobile-rn';

export default class Home extends Component {
    state={
        data:[],
    }
    componentWillMount() {
        this.gettokenName()
    }
    componentWillUnmount() { this.lister.remove(); }
    gettokenName=()=>{
        this.lister = DeviceEventEmitter.addListener('tokenName',(tokenName)=>{ 
            Super.super({
                url: '/api/menu/getMenu',
            },tokenName).then((res) => {
                //console.log(res.menus)
                this.setState({
                    data:res.menus,
                    tokenName
                })
            })
        })
    }
    renderItem=(item)=>{
        return <List>
                    {item.map((it)=>{
                        return <List.Item key={it.id}  onPress={()=>this.handleSubmit(it.id)} style={{marginLeft:0,paddingLeft:20}}>
                                    <Text>{it.title}</Text>
                                    <FontAwesome name={'angle-right'} style={{position: "absolute",right:15,fontSize: 16}}  />
                                </List.Item>
                    })}
                </List>
    }
    handleSubmit=(menuId)=>{
        const {tokenName}=this.state
        this.props.navigation.navigate('ItemList',{
            menuId,
            tokenName
          })
    }
    render(){
        const {data}=this.state
        console.log(data)
        return (
            <View>
                <Accordion>
                    {
                        data?data.map((item)=>{
                            return <Accordion.Panel header={item.title} key={item.id}>
                                        {
                                          item.level2s?this.renderItem(item.level2s):""
                                        }
                                    </Accordion.Panel>
                        }):""
                    }
                </Accordion>
            </View>
        )
    }
}