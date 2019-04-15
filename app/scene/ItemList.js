import React, {Component} from 'react';
import Super from "./../super"
import { DeviceEventEmitter,StyleSheet,ToastAndroid ,Text, View,ScrollView } from 'react-native';
import { SwipeAction,List,Button } from 'antd-mobile-rn'
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default class User extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
                title: navigation.getParam('title', 'A Nested Details Screen'),
                headerStyle: {
                    backgroundColor: '#148EE9',
                }, 
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerRight: (
                    <FontAwesome name={'navicon'} size={25} style={{color:'#fff',marginRight:10}}/>
                  ),
            }
      };
    state = {
		showDrawer: false,
		searchList: [],
		optArr: [],
        animating: false,
        active:false,
    }
    componentWillMount() {
        const { navigation } = this.props;
        const menuId = navigation.getParam('menuId', 'NO-ID');
        const tokenName=navigation.getParam('tokenName', 'NO-tokenName');
		this.requestList(menuId,tokenName)
    } 
    requestList=(menuId,tokenName,data)=>{
        Super.super({
            url: `/api/entity/curd/list/${menuId}`,
            data:data
        },tokenName).then((res) => {
            if(res) {
                this.setState({
                    list: res.entities,
                    searchList: res.criterias,
                    pageInfo: res.pageInfo,
                    showDrawer: false,
                    menuId,
                    tokenName
                })
            }
        })
} 
    render(){
        const { navigation } = this.props;
        const {list,showDrawer,searchList,optArr,pageInfo,tokenName} = this.state
        const totalPage = pageInfo ? Math.ceil(pageInfo.count / pageInfo.pageSize) : "";
        const right = [
            {
              text: 'Delete',
              onPress: () => console.log('delete'),
              style: { backgroundColor: 'red', color: 'white' },
            },
          ];
        return (
            <ScrollView>
                {list?list.map((item,index)=>{
                    return <SwipeAction
                                autoClose
                                style={{ backgroundColor: 'transparent' }}
                                right={right}
                                onOpen={() => console.log('open')}
                                onClose={() => console.log('close')} 
                                key={item.code}
                                >
                                <List 
                                    renderHeader={pageInfo?`${(pageInfo.pageNo-1)*pageInfo.pageSize+index+1}`:null} 
                                    key={item.code}
                                    >
                                    {item.fields?item.fields.map((it)=>{
                                        return <List.Item extra={it.value} key={it.id}>{it.title}</List.Item>
                                    }):null}
                                </List>
                            </SwipeAction>
                    }):null}
            </ScrollView>
        )
    }
}