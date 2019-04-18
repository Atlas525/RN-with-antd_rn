import React, {Component} from 'react';
import Super from "./../super"
import AsyncStorage from '@react-native-community/async-storage';
import { DeviceEventEmitter,StyleSheet,ToastAndroid ,Text, View, } from 'react-native';
import { Button,InputItem } from 'antd-mobile-rn';


export default class Login extends Component {
    static navigationOptions = {
        header:null
      };
    state={
        username: null,
        password: null,
    }
    componentDidMount(){
        this.loadAccountInfo()
    }
    loadAccountInfo = () => {
        AsyncStorage.getItem("userinfo").then(result => {
            const obj=JSON.parse(result)
            //console.log(result)
            this.setState({
                username:obj.username,
                password:obj.password,
            })       
        }).catch(error => {
            console.log("读取失败：" + error)
        })
    };
    toast=(msg)=>{
        ToastAndroid.showWithGravity(msg, ToastAndroid.SHORT,ToastAndroid.CENTER);
    }
    handleSubmit=()=>{
        const {username,password}=this.state
        if(username && password){
            let user={}
            user['username']=username
            user['password']=password
            Super.super({
                url: '/api/auth/token',
                query:user
            }).then((res) => {
                if(res.status === "504") {
                    this.toast('服务器连接失败');
                } else {
                    if(res.status === 'suc') {
                        //console.log(res.token)
                        // if(remember) {
                        //     const accountInfo = value.username + '&' + value.password;
                        //     Units.setCookie('accountInfo', accountInfo, 30);
                        // } else {
                        //     Units.delCookie('accountInfo');
                        //     this.setState({
                        //         username: "",
                        //         password: "",
                        //     })
                        // }
                        this.props.navigation.navigate('TabNav')
                        DeviceEventEmitter.emit('tokenName',res.token);
                        AsyncStorage.setItem("userinfo", JSON.stringify(user));
                    } else if(res.errorMsg) {
                        this.toast(res.errorMsg+"!");
                    }
                }
            })
        }else{
            this.toast('用户名或密码错误！')
        }
    }
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.H1}>欢迎登陆</Text>
                <InputItem
                    onChange={text => this.setState({username: text})} 
                    value={this.state.username}
                    clear
                    style={styles.inputs}
                    >
                    用户名
                </InputItem>
                <InputItem
                    onChange={text => this.setState({password: text})} 
                    value={this.state.password}
                    clear
                    type="password"
                    style={styles.inputs}
                    >
                    密码
                </InputItem>
                <Button style={styles.btn} onPressIn={this.handleSubmit} type="primary">
                    <Text>登录</Text>
                </Button>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal:25,
        paddingBottom:90, //为了使登录框向上偏移一点
    },
    H1:{
        textAlign:'center',
        fontSize: 24,
        marginBottom: 30
    },
    btn:{
        marginTop:30,
        backgroundColor: '#2567EF'
    },
    inputs:{
        marginLeft:0,
    }
})
  
