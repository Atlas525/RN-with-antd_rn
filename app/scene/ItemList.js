import React, {Component} from 'react';
import Super from "./../super"
import { Text,ScrollView,RefreshControl,StyleSheet,View,DrawerLayoutAndroid } from 'react-native';
import { SwipeAction,List,Button,ActivityIndicator,Toast } from 'antd-mobile-rn'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Popover,{ Rect } from 'react-native-popover-view'
import SearchBar from './SearchBar'

const rect=new Rect(290, 0, 220, 40)
class ListContent extends Component {
    
    state = {
        visible: false,
        searchList: [],
        optArr: [],
        animating: false,
        active:false,
        refreshing: false,
        searchwords:""
    }
    componentDidMount(){
        this.props.onRef(this)
		this.requestList()
    }
    componentWillMount() {
        const { navigation } = this.props;
        const menuId = navigation.getParam('menuId', 'NO-ID');
        const tokenName=navigation.getParam('tokenName', 'NO-tokenName');
        this.setState({
            menuId,
            tokenName
        })
    } 
    requestList=(data,isSearch)=>{
        const {menuId,tokenName}=this.state
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
                    searchwords:isSearch?data:''
                })
            }
        })
    } 
    goPage = (no) => {
        const {pageInfo,searchwords} = this.state
		const topageNo = pageInfo.pageNo + no
		const data = {
            pageNo:topageNo,
            pageSize:pageInfo.pageSize
        }
		for(let k in searchwords) {
			if(searchwords[k]) {
				data[k] = searchwords[k]
			}
        }
        this.setState({
            list:[],
            pageInfo:''
        });
        this.requestList(data)
    }
    _onRefresh = () => {
        const {searchwords}=this.state
        this.setState({
            refreshing: true,
            list:[],
            pageInfo:''
        });
        this.requestList(searchwords)
      }
    //显示下拉列表
    showPopover=()=> {
        this.setState({
            visible: true,
        });
    }
    popoverNav=(key)=>{
        const {searchList,tokenName,menuId}=this.state
        if(key===1){
            this.props.linkDrawer(searchList,tokenName)
        }else if(key===2){
            this.props.navigation.navigate('Details',{
                menuId,
                tokenName,
                title:'创建'
            })
        }else if(key===3){
            this.props.navigation.navigate('Home')
        }else if(key===4){
            this.props.navigation.navigate('Login')
        }else if(key===5){
            this.props.navigation.navigate('User')
        }
        this.setState({visible: false});
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
				this.requestList()
			} else {
				Toast.fail('删除失败！')
			}
		})
    }
    listPress = (code,title) => {
        const {menuId,tokenName} = this.state
		this.props.navigation.navigate('Details',{
            menuId,
            tokenName,
            title,
            code,
        })
	}
    render(){
        const {list,visible,pageInfo} = this.state
        const totalPage = pageInfo ? Math.ceil(pageInfo.count / pageInfo.pageSize) : "";
          
        return (
            <ScrollView 
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._onRefresh}/>
                }>
                <Popover
                    fromRect={rect}
                    onClose={()=>this.setState({visible: false})}
                    placement={'bottom'}
                    popoverStyle={{width:100}}
                    isVisible={visible}>
                    <View>
                        <Text key={1} style={styles.Text} onPress={()=>this.popoverNav(1)}>
                            <SimpleLineIcons name={"magnifier"} size={16}/>&nbsp;&nbsp;筛选
                        </Text>
                        <Text key={2} style={styles.Text} onPress={()=>this.popoverNav(2)}>
                            <SimpleLineIcons name={"plus"} size={16}/>&nbsp;&nbsp;创建
                        </Text>
                        <Text key={3} style={styles.Text} onPress={()=>this.popoverNav(3)}>
                            <SimpleLineIcons name={"home"} size={16}/>&nbsp;&nbsp;首页
                        </Text>
                        <Text key={4} style={styles.Text} onPress={()=>this.popoverNav(4)}>
                            <SimpleLineIcons name={"logout"} size={16}/>&nbsp;&nbsp;退出
                        </Text>                    
                        <Text key={5} style={styles.Text} onPress={()=>this.popoverNav(5)}>
                            <SimpleLineIcons name={"user"} size={16}/>&nbsp;&nbsp;用户
                        </Text>
                    </View>
                </Popover>
                <View style={styles.nextPage}>                    
                    <Text>
                        {pageInfo?`第${pageInfo.pageNo}页，共${pageInfo.count}条`:null}
                    </Text>
                    {pageInfo && pageInfo.pageNo!==1? <Button size="small" onPressIn={()=>this.goPage(-1)}>
                    上一页</Button>:null}
                </View>
                {list?list.map((item,index)=>{
                    return <SwipeAction
                                autoClose
                                style={{ backgroundColor: 'transparent' }}
                                right={[{
                                    text: '删除',
                                    onPress: () =>this.handelDelete(item.code),
                                    style: { backgroundColor: '#EE6363', color: 'white' },
                                    },{
                                    text: '详情',
                                    onPress: () =>this.listPress(item.code,item.title),
                                    style: { backgroundColor: '#0B79C7', color: 'white' },
                                    },]}
                                 key={item.code}
                                >
                                <List 
                                    renderHeader={pageInfo?`${(pageInfo.pageNo-1)*pageInfo.pageSize+index+1}`:null} 
                                    key={item.code}
                                    >
                                    {item.fields?item.fields.map((it)=>{
                                        return <List.Item extra={it.value} key={it.id}>{it.title}</List.Item>
                                    }):<ActivityIndicator text="加载中..."/>}
                                </List>
                            </SwipeAction>
                }):null}
                {pageInfo ? <Button>
                                {totalPage>=(pageInfo.pageNo+1)?<Text style={styles.next} onPress={()=>this.goPage(+1)}>--点击加载下一页--</Text>:
                                <Text style={styles.next}>没有更多了···</Text>}
                            </Button>: <ActivityIndicator text="加载中..."/>} 
            </ScrollView>
        )
    }
}

export default class DrawerBox extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
                title: navigation.getParam('title', 'A Nested Details Screen'),
                headerStyle: {
                    backgroundColor: '#2567EF',
                }, 
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerLeft: (
                    <View>
                        <SimpleLineIcons
                            name={'arrow-left'} 
                            size={20} 
                            style={styles.headerLeft}  
                            onPress={navigation.getParam('goBack')}/>
                    </View>
                  ),
                headerRight: (
                    <View>
                        <SimpleLineIcons
                            name={'options'} 
                            size={20} 
                            style={styles.headerRight}  
                            onPress={navigation.getParam('showPopover')}/>
                    </View>
                  ),
            }
      }
    state={
        openDrawer:false,
        optionsMap:{},
        searchList:[],
    }
    componentDidMount(){
        this.props.navigation.setParams({ showPopover: this.ListContent.showPopover });
        this.props.navigation.setParams({ goBack: this.goBack });
    }
    goBack=()=>{
        this.props.navigation.navigate('Home')
    }
    onRef = (ref) => {
		this.ListContent = ref
    }
    linkDrawer=(searchList,tokenName)=>{
        this.refs.drawerLayout.openDrawer()
        this.setState({
            searchList,
            tokenName,
        })
        this.getSearchOptions(searchList,tokenName)
    }
    getSearchOptions = (searchList,tokenName) => {
		const searchId = []
		if(searchList) {
			searchList.map((item) => {
				if(item.inputType === "select") {
					searchId.push(item.fieldId)
				}
				return false
			})
		}
		if(searchId.length > 0) {
			const formData = new FormData();
			searchId.map((item) => {
				formData.append('fieldIds', item);
				return false
            })
            fetch(`http://139.196.123.44/datacenter_api/api/field/options`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    "datamobile-token": tokenName
                    // 'Content-Type': 'multipart/form-data',
                },
                processData: false,
                contentType: false,
                body: formData,
            }).then((response)=> {
                return response.json();
            }).then((data)=> {
                this.setState({
                    optionsMap:data.optionsMap
                })
            }).catch((e)=> {
                console.log(e);
            });
        }       
    }
    handleSearch = (values) => {
		this.ListContent.requestList(values,true) //true为了和页码分开
        this.refs.drawerLayout.closeDrawer()
	}
    render(){
        const {searchList,optionsMap,tokenName}=this.state
        const sidebar = (
            <ScrollView>
                <SearchBar 
                    navigation={this.props.navigation} 
                    searchList={searchList} 
                    optionsMap={optionsMap} 
                    tokenName={tokenName}
                    handleSearch={this.handleSearch}/>
            </ScrollView>
          );
        return(
            <DrawerLayoutAndroid
                ref={'drawerLayout'}
                renderNavigationView={() => sidebar} 
                drawerPosition={DrawerLayoutAndroid.positions.Right}
                drawerLockMode='locked-closed' 
                drawerBackgroundColor="#F5F5F9"
                keyboardDismissMode="on-drag"    
            >
                <ListContent 
                    navigation={this.props.navigation} 
                    onRef = {this.onRef}
                    linkDrawer={this.linkDrawer}
                    />
            </DrawerLayoutAndroid>
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
    headerLeft:{
        color:'#fff',
        marginLeft:18
    },
    nextPage:{
        flexDirection:'row',
        height:40,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    next:{
        fontSize:15
    }

})