import React, {Component} from 'react';
import Super from "./../super"
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { DeviceEventEmitter,StyleSheet,ToastAndroid ,Text, View,ScrollView } from 'react-native';
import { Accordion, List } from 'antd-mobile-rn';
import * as Animatable from 'react-native-animatable';

export default class Home extends Component {
    static navigationOptions = {
        title: '首页',
        headerStyle: {
          backgroundColor: '#2567EF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
    };
    state={
        data:[],
        activeSections:""
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
    onChange = activeSections => {
        this.setState({ activeSections });
      };
    renderItem=(item,isActive)=>{
        return <Animatable.View
                    duration={500}
                    easing="ease-out"
                    animation={isActive ? 'fadeInDown' : null}
                    >
                    {item.map((it)=>{
                        return  <List.Item style={styles.smallList} key={it.id}  onPressIn={()=>this.toList(it.id,it.title)}>
                                        <Text style={styles.listText}>{it.title}</Text>
                                        <FontAwesome name={'angle-right'} style={styles.FontAwesome}  />
                                </List.Item>
                    })}
                </Animatable.View>
    }
    toList=(menuId,title)=>{
        const {tokenName}=this.state
        this.props.navigation.navigate('ItemList',{
            menuId,
            tokenName,
            title
        })
    }
    render(){
        const {data,activeSections}=this.state
        return (
            <ScrollView style={styles.homecontain}>
                <Accordion
                    onChange={this.onChange}
                    activeSections={this.state.activeSections}>
                    {data?data.map((item)=>{
                        const id=item.id
                        return  <Accordion.Panel header={item.title} key={id} style={styles.Panel}>
                                    {item.level2s?this.renderItem(item.level2s,activeSections===id.toString()?true:false):null }
                                </Accordion.Panel>
                        }):null}
                </Accordion>
            </ScrollView>
        )
    }
}
const styles = StyleSheet.create({
    homecontain:{
        padding:20,
        backgroundColor:'#F6F6FA'
    },
    Panel:{
        height:65,
        backgroundColor:"#fff",
    },
    list:{
        marginLeft:10,
    },
    FontAwesome:{
        position: "absolute",
        right:15,
        fontSize: 16
    },
    listText:{
        paddingLeft:20,
        fontSize:18
    },
    smallList:{
        height:60
    }

})