import React, {Component} from 'react'
import {Image} from 'react-native'
import { List,Toast } from 'antd-mobile-rn';
import ImagePicker from 'react-native-image-picker';
const Item = List.Item

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
			cancelButtonTitle: '取消',
			takePhotoButtonTitle: '拍照', 
			chooseFromLibraryButtonTitle: '选择照片',
			cameraType: 'back',
			mediaType: 'photo',
			videoQuality: 'high', 
			durationLimit: 10, 
			maxWidth: 300,
			maxHeight: 300,
			quality: 0.8, 
			angle: 0,
			allowsEditing: false, 
			noData: false,
			storageOptions: {
					skipBackup: true  
			}
	};
		ImagePicker.showImagePicker(options, (response) => {
			console.log('Response = ', response);
		   
			if (response.didCancel) {
			  console.log('User cancelled image picker');
			} else if (response.error) {
			  console.log('ImagePicker Error: ', response.error);
			}else {
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
			<Item 
				extra={files?<Image style={{width: 50, height: 50}} source={files} />:`请选择${title}`} 
				arrow="horizontal" 
				onPressIn={()=>this.showSelectImgBox(title)}>
				{title}
			</Item>
		)
	}
}