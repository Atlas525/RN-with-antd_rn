import React, {Component} from 'react';
import Super from "./../super"
import AsyncStorage from '@react-native-community/async-storage';
import { DeviceEventEmitter,StyleSheet,ToastAndroid ,Text, View, } from 'react-native';
import { Button,InputItem,Checkbox } from 'antd-mobile-rn';
const AgreeItem = Checkbox.AgreeItem

export default class Login extends Component {
    static navigationOptions = {
        header:null
    };
    state={
        username: null,
        password: null,
		remember: true
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
        const {username,password,remember}=this.state
        if(username && password){
            const user={
                username,
                password
            }
            Super.super({
                url: '/api/auth/token',
                query:user
            }).then((res) => {
                if(res.status === "504") {
                    this.toast('服务器连接失败');
                } else {
                    if(res.status === 'suc') {
                        remember?AsyncStorage.setItem("userinfo", JSON.stringify(user)): AsyncStorage.removeItem('userinfo')
                        this.props.navigation.navigate('TabNav')
                        DeviceEventEmitter.emit('tokenName',res.token);
                    } else if(res.errorMsg) {
                        this.toast(res.errorMsg+"!");
                    }
                }
            })
        }else{
            this.toast('用户名或密码错误！')
        }
    }
    remchange = (e) => {
		this.setState({
			remember: e.target.checked
		});
	}
    render() {
        const {username,password,remember} = this.state
        return (
            <View style={styles.container}>
                <Text style={styles.H1}>欢迎登陆</Text>
                <InputItem
                    onChange={text => this.setState({username: text})} 
                    value={username}
                    clear
                    style={styles.inputs}
                    >
                    <Text style={styles.words}>用户名</Text>
                </InputItem>
                <InputItem
                    onChange={text => this.setState({password: text})} 
                    value={password}
                    clear
                    type="password"
                    style={styles.inputs}
                    >
                    <Text style={styles.words}>密码</Text>
                </InputItem>
                <AgreeItem onChange={this.remchange} checked={remember} style={styles.AgreeItem}>
                    <Text style={styles.words}>记住密码</Text>
                </AgreeItem>
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
        fontSize: 26,
        marginBottom: 30
    },
    btn:{
        marginTop:30,
        backgroundColor: '#2567EF'
    },
    inputs:{
        marginLeft:0,
        fontSize:27,
        marginTop:10,
    },
    AgreeItem:{
        fontSize:20,
        marginTop:20
    },
    words:{
        fontSize:18
    }
})
  
