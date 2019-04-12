import React, {Component} from 'react';
import Super from "./../super"
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { DeviceEventEmitter,StyleSheet,ToastAndroid ,Text, View,ScrollView } from 'react-native';
import { Accordion, List } from 'antd-mobile-rn';
import * as Animatable from 'react-native-animatable';

export default class Home extends Component {
    static navigationOptions = {
        title: 'Home',
        /* No more header config here! */
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
                    duration={300}
                    easing="ease-out"
                    animation={isActive ? 'zoomIn' : false}
                    >
                    <List style={styles.list}>
                        {item.map((it)=>{
                            return  <List.Item key={it.id}  onPressIn={()=>this.toList(it.id)}>
                                            <Text style={{paddingLeft:20}}>{it.title}</Text>
                                            <FontAwesome name={'angle-right'} style={{position: "absolute",right:15,fontSize: 16}}  />
                                    </List.Item>
                        })}
                    </List>
                </Animatable.View>
    }
    toList=(menuId)=>{
        const {tokenName}=this.state
        this.props.navigation.navigate('ItemList',{
            menuId,
            tokenName
          })
    }
    render(){
        const {data,activeSections}=this.state
        return (
            <ScrollView>
                <Accordion
                    onChange={this.onChange}
                    activeSections={this.state.activeSections}
                >
                    {
                        data?data.map((item)=>{
                            const id=item.id
                            return <Accordion.Panel header={item.title} key={id} style={styles.Panel}>
                                        {
                                          item.level2s?this.renderItem(item.level2s,activeSections===id.toString()?true:false):""
                                        }
                                    </Accordion.Panel>
                        }):""
                    }
                </Accordion>
            </ScrollView>
        )
    }
}
const styles = StyleSheet.create({
    Panel:{
        height:60,
    },
    list:{
        marginLeft:10,
    }
})