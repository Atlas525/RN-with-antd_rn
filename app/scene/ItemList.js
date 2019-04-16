import React, {Component} from 'react';
import Super from "./../super"
import { Text,ScrollView,RefreshControl,StyleSheet,View } from 'react-native';
import { SwipeAction,List,Button,ActivityIndicator,Toast } from 'antd-mobile-rn'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Popover,{ Rect } from 'react-native-popover-view'

const rect=new Rect(290, 0, 220, 40)
export default class User extends Component {
    static navigationOptions = ({ navigation }) => {
        const {state, setParams} = navigation;
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
                    <View>
                        <SimpleLineIcons 
                            ref={ref => this.touchable = ref}
                            name={'options'} 
                            size={20} 
                            style={styles.headerRight}  
                            onPress={(navigation.getParam('showPopover'))}/>
                    </View>
                  ),
            }
      };
    state = {
        visible: false,
        spinnerRect: {},
        searchList: [],
        optArr: [],
        animating: false,
        active:false,
        refreshing: false,
    }
    componentDidMount(){
        this.props.navigation.setParams({ showPopover: this.showPopover });
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
                    tokenName,
                    refreshing: false,
                })
            }
        })
    } 
    goPage = (no) => {
        const {pageInfo,menuId,searchwords,tokenName} = this.state
		let data = {}
		const topageNo = pageInfo.pageNo + no
		data["pageNo"] = topageNo
		data["pageSize"] = pageInfo.pageSize
		for(let k in searchwords) {
			if(searchwords[k]) {
				data[k] = searchwords[k]
			}
        }
        this.setState({
            list:[],
            pageInfo:''
        });
        this.requestList(menuId,tokenName, data)
    }
    _onRefresh = () => {
        const {menuId,tokenName} = this.state
        this.setState({
            refreshing: true,
            list:[],
            pageInfo:''
        });
        this.requestList(menuId,tokenName)
      }
    //显示下拉列表
    showPopover=()=> {
        this.setState({
            visible: true,
        });
    }
    closePopover=()=> {
        this.setState({
            visible: false
        });
    }
    popoverNav=(key)=>{
        alert(key)
    }
    handelDelete = (code) => {
        const {menuId,tokenName} = this.state
		Super.super({
			url: `/api/entity/curd/remove/${menuId}`,
			data: {
				codes: code
			}
		},tokenName).then((res) => {
			if(res.status === "suc") {
				Toast.success("删除成功！") //刷新列表 
				this.requestList(menuId,tokenName)
			} else {
				Toast.fail('删除失败！')
			}
		})
	}
    render(){
        const { navigation } = this.props;
        const {list,visible,searchList,optArr,pageInfo,spinnerRect} = this.state
        const totalPage = pageInfo ? Math.ceil(pageInfo.count / pageInfo.pageSize) : "";
          
        return (
            <ScrollView 
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}
                        />
                }
            >
            <Popover
                fromRect={rect}
                fromView={this.touchable}
                onClose={this.closePopover}
                placement={'bottom'}
                popoverStyle={{width:100}}
                isVisible={visible}>
                <View>
                    <Text key={1} style={styles.Text} onPress={()=>this.popoverNav('1')}>
                        <SimpleLineIcons name={"magnifier"} size={16}/>&nbsp;&nbsp;筛选
                    </Text>
                    <Text key={2} style={styles.Text}>
                        <SimpleLineIcons name={"plus"} size={16}/>&nbsp;&nbsp;创建
                    </Text>
                    <Text key={3} style={styles.Text}>
                        <SimpleLineIcons name={"home"} size={16}/>&nbsp;&nbsp;首页
                    </Text>
                    <Text key={4} style={styles.Text}>
                        <SimpleLineIcons name={"logout"} size={16}/>&nbsp;&nbsp;退出
                    </Text>                    
                    <Text key={5} style={styles.Text}>
                        <SimpleLineIcons name={"user"} size={16}/>&nbsp;&nbsp;用户
                    </Text>
                </View>
            </Popover>
                {list?list.map((item,index)=>{
                    return <SwipeAction
                                autoClose
                                style={{ backgroundColor: 'transparent' }}
                                right={[{
                                    text: '删除',
                                    onPress: () =>this.handelDelete(item.code),
                                    style: { backgroundColor: '#EE6363', color: 'white' },
                                    },]}
                                key={item.code}
                                >
                                <List 
                                    renderHeader={pageInfo?`${(pageInfo.pageNo-1)*pageInfo.pageSize+index+1}`:null} 
                                    key={item.code}
                                    >
                                    {item.fields?item.fields.map((it)=>{
                                        return <List.Item extra={it.value} key={it.id} style={{backgroundColor:'#ddd'}}>{it.title}</List.Item>
                                    }):<ActivityIndicator text="加载中..."/>}
                                </List>
                            </SwipeAction>
                }):null}
                {pageInfo ? <Button>
                                {totalPage>=(pageInfo.pageNo+1)?<Text onPress={()=>this.goPage(+1)}>--点击加载下一页--</Text>:
                                <Text>没有更多了···</Text>}
                            </Button>: <ActivityIndicator style={{marginTop:24}} text="加载中..."/>} 
            </ScrollView>
        )
    }
}
const styles = StyleSheet.create({
    Text:{
        paddingLeft:0,
        textAlign: 'center',
        lineHeight:40,
        fontSize: 18
    },
    headerRight:{
        color:'#fff',
        marginRight:18
    },

})