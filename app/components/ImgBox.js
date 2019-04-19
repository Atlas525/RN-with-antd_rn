import React, {Component} from 'react'
import {Image} from 'react-native'
import { List,Toast } from 'antd-mobile-rn';
import ImagePicker from 'react-native-image-picker';
const Item = List.Item

var photoOptions = {
    //底部弹出框选项
    title:'请选择',
    cancelButtonTitle:'取消',
    takePhotoButtonTitle:'拍照',
    chooseFromLibraryButtonTitle:'选择相册',
    quality:0.75,
    allowsEditing:true,
    noData:false,
    storageOptions: {
        skipBackup: true,
        path:'images'
    }
}
export default class ImgBox extends Component {

	state = {
		files: this.props.files,
	}
	onChange = (files, type) => {
		console.log(files, type);
		this.setState({
			files,
		});
		this.triggerChange(files);
	}
	triggerChange = (changedValue) => {
		const onChange = this.props.onChange;
		if(onChange) {
			onChange(changedValue);
		}
	}
	showSelectImgBox=(title)=>{
		const options = {
			title: `选择${title}`,
			storageOptions: {
			  skipBackup: true,
			  path: 'images',
			},
		  };
		ImagePicker.showImagePicker(options, (response) => {
			console.log('Response = ', response);
		   
			if (response.didCancel) {
			  console.log('User cancelled image picker');
			} else if (response.error) {
			  console.log('ImagePicker Error: ', response.error);
			} else if (response.customButton) {
			  console.log('User tapped custom button: ', response.customButton);
			} else {
			  const source = { uri: response.uri }
		   
			  this.setState({
				files: source,
			  });
			}
		  });
	}
	render() {
		const {formList} = this.props
		const {files} = this.state
		const {title,fieldId} = formList
		
		return(
			<Item extra={files?<Image source={files} />:`请选择${title}`} arrow="horizontal" onPressIn={()=>this.showSelectImgBox(title)}>
				{title}
			</Item>
		)
	}
}