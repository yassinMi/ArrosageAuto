


import { pipelineTopicExpression } from '@babel/types';
import DateTimePicker, {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import React, { Component, createRef, RefObject } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Text, View, Platform, StatusBar, TextInput, FlatList, Image, Modal, Switch, AsyncStorage, Alert, AlertButton, ProgressBarAndroid, ColorPropType, VirtualizedList, Picker, Dimensions, ViewStyle, StyleProp, TextStyle, TouchableHighlight, DatePickerAndroid, Insets, ScrollView, Pressable, TouchableWithoutFeedback, ToastAndroid } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Svg, { Path, SvgXml } from 'react-native-svg';
import ClientUtils, { AutoOptions, Conditon, ConfigMode, DeviceConfig } from '../../Services/ClientUtils';
import { FormatDuration } from '../../Services/Common/Utils';
import { ConditionCreateDlg, DurationTypeMi, DurationTypeMiFromSeconds, DurationTypeMiToSeconds, DurationTypeMiToString, GPDurationPickerMi } from '../Common/GPDurationPickerMi';
import SvgMi, { st } from '../Common/SvgMi';
import { Palette } from '../Common/theme';
import { ButtonMi } from './ButtonMi';
import { ConditionsEditor } from './ConditionsEditor';
import DeviceCard from './DeviceCard';
import { DeviceState } from './DeviceState';
import DHTPanel from './DHTPanel';
import { IconButtonMi } from './IconButtonMi';




const deviceScreen_wraper_style : StyleProp<ViewStyle> = {
    flex:1,
    alignSelf:"stretch",
    backgroundColor:Palette.whitePaper,
    padding:4,
    
    
}

const device_title_style : StyleProp<TextStyle> = {
    fontSize:20,
    fontWeight:"bold",
    color:'#0d2247',
    marginLeft:4,
    fontFamily:"poppins",
    alignSelf:"center"
}



const section_header_style : StyleProp<TextStyle> = {
    fontSize:18,
    fontWeight:"500",
    color:'#0d2247',
    marginLeft:4
}



const deviceScreen_style : StyleProp<ViewStyle> = {
    backgroundColor : Palette.whitePaper,
    height:"100%"
}
type DeviceScreen_props = {
    /**not used anymore the component will fetch data on mount*/
    currentConfig?:DeviceConfig,
    deviceID: string,
    deviceState: boolean,
    deviceLabel:string,
    onBack:()=>void,
    onDeviceConfigChange:(id:string,newConfig:DeviceConfig)=>void,
    onDeviceManualStateChange:(id:string,newState:boolean)=>void,
}
type DeviceScreen_state = {
    currentConfig:DeviceConfig
    deviceState: boolean,

}
export default class DeviceScreen extends Component<DeviceScreen_props, DeviceScreen_state>{
    constructor(props:Readonly<DeviceScreen_props>) {
        super(props)
        this.state = {
            currentConfig:null,
            deviceState:props.deviceState
            
        }
        this.autoOptsSection_ref=createRef();
        this.handleModeSelectionChange=this.handleModeSelectionChange.bind(this)
        this.handleSaveChangesClick=this.handleSaveChangesClick.bind(this)
    }
    autoOptsSection_ref : RefObject<AutoOptionsSection>
    componentDidMount(): void {
        ClientUtils.GetDeviceConfigWS(this.props.deviceID,true)
        .then(confg=>{
            this.setState({currentConfig:confg})
        })

        ClientUtils.GetDeviceStateWS(this.props.deviceID)
        .then(stt=>{
            this.setState({deviceState:stt})
        })
    }
    handleModeSelectionChange(newMode:string){
        this.setState((old)=>({currentConfig:{...old.currentConfig, mode:newMode as ConfigMode}}),()=>{
            ClientUtils.SetDeviceConfigWS(this.props.deviceID,this.state.currentConfig).then((res)=>{
                if(res){
                    this.props.onDeviceConfigChange(this.props.deviceID,this.state.currentConfig)
                }

            })

        })
    }
    handleOptionsClick(){
        alert("not implemented yet")
    }
    handleSaveChangesClick(){
        let newAutoOpts = this.autoOptsSection_ref.current.liftChanges();
        this.setState((old)=>({currentConfig:{...old.currentConfig,autoOptions:newAutoOpts}}),()=>{
            ClientUtils.SetDeviceConfigWS(this.props.deviceID,this.state.currentConfig).then(success=>{
                if(!success){
                    alert("something went wrong")
                }
                else{
                    ToastAndroid.show(`Saved settings`,1000);
                }
            })
        });
        
    }
   
    render() {
        
        /**while fetching data can be navailable, use loader UI */
        const availableConfig = this.state.currentConfig!=null
        const auto =availableConfig&& this.state.currentConfig.mode=="automated";
        const manual =availableConfig&&  this.state.currentConfig.mode=="manual";
        const none =availableConfig&&  this.state.currentConfig.mode=="none"
        const deviceState = this.state.deviceState
 
        return (

            <View style={deviceScreen_style} >
                <View style={{borderRadius:0,backgroundColor:Palette.lightsOutBlack,height:112,
                borderTopEndRadius:0,borderTopStartRadius:0,position:'absolute',width:"100%"}}>
                </View>
                
                { <DeviceHeader onOptionsClick={this.handleOptionsClick} 
                onBackClick={this.props.onBack}
                title={this.props.deviceLabel} deviceState={this.props.deviceState} />
                }
                <ScrollView contentContainerStyle={{flexGrow:1}} style={{flex:1,}}>
                <DeviceInfoSection deviceLabel={this.props.deviceLabel} 
                devicePin={this.props.deviceID}
                deviceState={this.state.deviceState}
                onLableUpdate={()=>{}}
                />
                  <Text style={[text_options_group_style,{marginBottom:12}]} >Mode d'operation:</Text>
                {availableConfig&&<ChipsPanel onSelectionChanged={this.handleModeSelectionChange} 
                selection={this.state.currentConfig.mode} 
                options={[{id:"manual",caption:"Manual"},{id:"automated",caption:"Automated"} , {id:"none",caption:"None"}]} />
                }{auto&&(
                    <AutoOptionsSection ref={this.autoOptsSection_ref}  AutoOptionsObj={this.state.currentConfig.autoOptions} />
                )}
               
                {manual&&(
                    <View style={{alignItems:"center", justifyContent:"center", flex:1,flexDirection:"column",}}>
                        <ButtonMi
                        innerTextStyle={{
                            color:Palette.primary_2_text, fontSize:18,
                        }}
                        underlayColor={Palette.primary_2_brighter}
                        wrapperStyle={{backgroundColor:Palette.primary_2,height:58, minWidth:104,margin:10,
                            alignItems:"center", justifyContent:"center", borderRadius:10, elevation:4,
                            opacity:deviceState?0.6:1, 
                            paddingHorizontal:12}}
                             caption="START" 
                             isdisabled={deviceState}
                             onClick={()=>{
                                ClientUtils.SetDeviceStateWS(this.props.deviceID,true)
                                .then((res)=>{
                                    //this.props.requestRefresh(res);
                                    this.props.onDeviceManualStateChange(this.props.deviceID,res)
                                })
                                this.setState({deviceState:true},()=>{
                                    

                                   /* requestAnimationFrame(()=>{
                                        
                                    })*/
                                    
                                    
                                })
                            }} 
                             />
                             <ButtonMi
                        innerTextStyle={{
                            color:Palette.primary_2_text, fontSize:18,
                        }}
                        underlayColor={Palette.lavaRed_brighter}
                        wrapperStyle={{backgroundColor:Palette.lavaRed,height:58, minWidth:104,margin:10,
                            alignItems:"center", justifyContent:"center", borderRadius:10,elevation:4,
                            opacity:deviceState?1:0.6,  
                            paddingHorizontal:12}}
                             caption="STOP" 
                             isdisabled={!deviceState}
                             onClick={()=>{
                                this.setState({deviceState:false},()=>{
                                    ClientUtils.SetDeviceStateWS(this.props.deviceID,false)
                                        .then((res)=>{
                                            this.setState({deviceState:res});
                                            this.props.onDeviceManualStateChange(this.props.deviceID,res)
                                        
                                        })
                                    /*requestAnimationFrame(()=>{
                                        

                                    })*/
                                   
                                    
                                })
                            }} 
                             />
                    </View>
                )}
                 {none&&(
                    <View style={{alignSelf:"center",flex:1,alignItems:"center",justifyContent:"center"}}><Text style={{color:"#666666",top:"25%",position:"absolute"}} >Device is disabled</Text></View>
                )}

                </ScrollView>
                {auto&&(
                    <ButtonMi onClick={this.handleSaveChangesClick}
                     wrapperStyle={{  width:"85%",height:42,alignItems:"center", justifyContent:"center",  maxWidth:230,borderRadius:100, marginBottom:16,  backgroundColor:Palette.primary_2}}
                     innerTextStyle={{color:Palette.primary_2_text}}
                     caption='SAVE CHANGES' />
                )}
                

            </View>
        )
    }
}




type DeviceHeader_props = {
    title:string,
    deviceState: boolean
    onOptionsClick:()=>void
    onBackClick:()=>void
}
type DeviceHeader_state = {

}
export  class DeviceHeader extends Component<DeviceHeader_props, DeviceHeader_state>{
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render() {
        return (
            <View style={{flexDirection:"row",alignSelf:"stretch",alignItems:'center',paddingHorizontal:6, justifyContent:"space-between"}} >
                <IconButtonMi 
                onClick={this.props.onBackClick}
                underlayColor={'#32323230'}
                hitSlop={{bottom:16,top:16,left:16,right:36}}
                color='white' innerSvgMiData={st.chevron_left} innerSvgMiSize={24}
                wrapperStyle={{backgroundColor:'transparent', width:32,height:32, borderRadius:100}}
                />
                <View style={{flexDirection:"row", alignItems:"center", height:40,flexShrink:1 }}>
                <Text  numberOfLines={1} ellipsizeMode="tail"  style={{color:"white", flexShrink:1, marginRight:6,fontSize:16}}  > {this.props.title}</Text>
{                false&&<DeviceState state={this.props.deviceState} overrideStyle={{alignSelf:"center"}} ></DeviceState>
}
                </View> 

                <IconButtonMi 
                onClick={this.props.onOptionsClick}
                underlayColor={'#32323230'}
                hitSlop={{bottom:16,top:16,left:36,right:16}}
                color='white' innerSvgMiData={st.more_horiz} innerSvgMiSize={24}
                wrapperStyle={{backgroundColor:'transparent', width:32,height:32, borderRadius:100}}
                />
               
            </View>
        )
    }
}





type DeviceInfoSection_props = {
    deviceLabel:string,
    devicePin:string,
    deviceState: boolean
    onLableUpdate:()=>void
}
type DeviceInfoSection_state = {

}
/**
 * encapsulates the status tag and pin informaion with otential other information
 * this could have been embeded in the header component as an alternative design
 */
export  class DeviceInfoSection extends Component<DeviceInfoSection_props, DeviceInfoSection_state>{
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render() {
        return (
            <View style={{flexDirection:"row",alignSelf:"stretch",
             marginHorizontal:10,
             maxHeight:90,
             minHeight:90,
            marginVertical:10, overflow:"hidden", paddingTop:4,
             paddingBottom:4, 
            alignItems:'center',
            backgroundColor:Palette.whitePanel, elevation:2, zIndex:50, borderRadius:16,}} >
                 <View style={{borderRadius:100,height:48, marginLeft:10,marginRight:0,
                 backgroundColor:"#dfe7e2",
                  width:48,alignItems:"center",justifyContent:"center"}}>
                <SvgMi xmldata={st.plant1Mi}  size={32} 
                color='#397947' style={{}} ></SvgMi>

                </View>
                <View style={{flex:1}} >
                    <View style={{
                        height: 32, marginHorizontal: 8,
                        flexDirection: "row", alignItems: "center", flex: 1,
                        //backgroundColor:"yellow",
                        justifyContent: "space-evenly"
                    }} >
                       
                        <Text numberOfLines={2} ellipsizeMode="tail" style={{ fontSize: 14, fontWeight: "bold", marginLeft: 8, flexShrink: 1 }} >{this.props.deviceLabel}</Text>
                        {true && <Text style={{ fontSize: 14 }} >|</Text>}
                        <View style={{ height: 32, marginHorizontal: 8, flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }} >
                            <SvgMi color='black' size={18} xmldata={st.memory} ></SvgMi>
                            <Text style={{ fontSize: 14, fontWeight: "bold", marginLeft: 4 }} >{"GPIO"}{this.props.devicePin}</Text>
                        </View>

                       
                            {true && <Text style={{ fontSize: 14 }} >|</Text>}
                            <DeviceState state={this.props.deviceState} overrideStyle={{ alignSelf:"center",  marginLeft: 6, minWidth:54 }} ></DeviceState>


                    </View>






                </View>
              
                
               
            </View>
        )
    }
}

const coolColor = "#45988710"

const ChipsPanel_wrapper_style : StyleProp<ViewStyle> = {
    flexDirection:"row",
    alignItems:"center",

}

type ChipsPanel_props = {
    options: {id:string,caption:string}[]
    selection : string
    onSelectionChanged : (newSelection:string)=>void

}
type ChipsPanel_state = {

}
export  class ChipsPanel extends Component<ChipsPanel_props, ChipsPanel_state>{
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render() {
        return (

            <View style={ChipsPanel_wrapper_style} >
                {this.props.options.map(opt=>(
                    <Chip id={opt.id} isSelected={this.props.selection===opt.id} key={opt.id} caption={opt.caption} onClick={(()=>{this.props.onSelectionChanged(opt.id)}).bind(this)} />
                ))}
                
            </View>
        )
    }
}







const chip_default_style : StyleProp<ViewStyle> = {  
    borderRadius: 100,
    height:28,
    alignItems:"center", justifyContent:"center",
    paddingHorizontal:12,
    marginHorizontal: 6,
    backgroundColor: Palette.whitePanel
}
const chip_selected_style : StyleProp<ViewStyle> = {
    backgroundColor:Palette.primary_2, 
}
const chip_default_text_style : StyleProp<TextStyle> = {
    fontSize: 14,
    color: Palette.inkDarkGrey,
    textAlignVertical: "center", textAlign:"center"
}
const chip_selected_text_style : StyleProp<TextStyle> = {
    color: Palette.primary_2_text,

}
type Chip_props = {
    id:string
    caption:string
    isSelected: boolean
    onClick : ()=>void
}
type Chip_state = {

}
export  class Chip extends Component<Chip_props, Chip_state>{
    constructor(props:Readonly<Chip_props>) {
        super(props)
        this.state = {
        }
    }
  
    
    handleClick(){
        this.props.onClick();
    }
    render() {
        const isselected =this.props.isSelected;
        return (

            <TouchableHighlight underlayColor={Palette.primary_2_opac40} onPress={this.handleClick.bind(this)} style={isselected?[chip_default_style,chip_selected_style]:chip_default_style} >
                 <Text   style={isselected?[chip_default_text_style,chip_selected_text_style]:chip_default_text_style} >{this.props.caption}</Text>
            </TouchableHighlight>
        )
    }
}





const text_options_group_style: StyleProp<TextStyle>={
    color:Palette.primary_2,
    fontSize:16,
    fontWeight:"500",
    marginLeft:6, marginVertical:4,

}
const text_option_key_style: StyleProp<TextStyle>={
    color:"#666666",
    fontSize:13,
    fontWeight:"500",
    marginLeft:10, marginVertical:4,

}
const text_option_value_style: StyleProp<TextStyle>={
    color:Palette.inkDarkGrey,
    fontSize:14,
    fontWeight:"100",    
    marginLeft:10,  marginBottom:4,
}
type AutoOptionsSection_props = {
    AutoOptionsObj: AutoOptions

}
type AutoOptionsSection_state = {
    currentStartsAtDate : Date,
    currDuration : number,
    /**seconds */
    currRepeatEvery : number,
    currConditions: Conditon [],
    dp_open:boolean
    dp_initial_dur: DurationTypeMi
    db_done_result: (dur: DurationTypeMi|null)=>void
    conditionForm_open : boolean
    conditionForm_openForEdit : boolean //works with conditionForm_open, indicates whther the dialog will be used to create a new condition or edit an existing one
    conditionToEdit : Conditon //used with conditionForm_openForEdit=true and holds reference to the original condition objeect that was long pressed by the user

}
export  class AutoOptionsSection extends Component<AutoOptionsSection_props, AutoOptionsSection_state>{
    constructor(props:Readonly<AutoOptionsSection_props>) {
        super(props)
        this.state = {
            currConditions:props.AutoOptionsObj.conditions,
            currDuration: this.props.AutoOptionsObj.duration,
            currRepeatEvery : props.AutoOptionsObj.repeatEvery,
            currentStartsAtDate : props.AutoOptionsObj.startsAt,
            dp_open:false,
            dp_initial_dur: {unit:"d",value:1},
            conditionForm_open : false,
            conditionForm_openForEdit: false,
            conditionToEdit : null,
            db_done_result:()=>{},

        }
        this.openDurationPickerMi=this.openDurationPickerMi.bind(this)
    }
    //pure f wraps current fields into a new AutoOptions and returns it
    //can be called by perent component to save things
    liftChanges():AutoOptions{
        let newOpts : AutoOptions = {
            startsAt:this.state.currentStartsAtDate,
            duration:this.state.currDuration,
            repeatEvery:this.state.currRepeatEvery,
            conditions:this.state.currConditions,
        }
        return newOpts;
    }
    openDurationPickerMi(initialDuration:DurationTypeMi,cb:(result: DurationTypeMi|null)=>void){
        this.setState({dp_initial_dur:initialDuration, dp_open:true,db_done_result:(res)=>{cb(res);this.setState({dp_open:false})}})
    }
    render() {
        const durationAsDTypeMi = DurationTypeMiFromSeconds(this.state.currDuration);
        const repeatEveryAsDTypeMi = DurationTypeMiFromSeconds(this.state.currRepeatEvery);
        return (

            <View style={{marginTop:10, flexGrow:1}} >
                <Modal onRequestClose={(()=>{this.setState({dp_open:false})}).bind(this)} transparent style={{height:"100%"}}  visible={this.state.dp_open}>
                    <TouchableOpacity activeOpacity={1} style={{backgroundColor:'#00000080',height:"100%", alignContent:"center",justifyContent:"center", flexDirection:"column",alignItems:"center"}}  onPressOut={(()=>{this.setState({dp_open:false})}).bind(this)} >
                        <TouchableOpacity activeOpacity={1} style={{}}  onPressIn={()=>{}} >
                        <GPDurationPickerMi onDone={(num,nit)=>{
                            this.state.db_done_result({unit:nit,value:num} as DurationTypeMi)
                        }} onCancel={()=>{//todo messy part. this modale closure should be carried out at the invoker function 
                            this.setState({dp_open:false})
                        }} initialSelectedOption={this.state.dp_initial_dur.unit} 
                        initialValue={this.state.dp_initial_dur.value} />
                        </TouchableOpacity>

                    </TouchableOpacity>
                    
                </Modal>
                <Modal onRequestClose={(()=>{this.setState({conditionForm_open:false})}).bind(this)} transparent 
                style={{height:"100%"}}  visible={this.state.conditionForm_open}>
                    <TouchableOpacity activeOpacity={1} style={{backgroundColor:'#00000080',height:"100%",
                     alignContent:"center",justifyContent:"center", flexDirection:"column",alignItems:"center"}} 
                      onPressOut={(()=>{this.setState({conditionForm_open:false})}).bind(this)} >
                        <TouchableOpacity activeOpacity={1} style={{}}  onPressIn={()=>{}} >
                        <ConditionCreateDlg editMode={this.state.conditionForm_openForEdit} conditionToEdit={this.state.conditionToEdit}
                         onDone={(newCondition)=>{
                             if(this.state.conditionForm_openForEdit)
                            this.setState(old=>({currConditions:old.currConditions.map((c)=>{
                                if(c!=this.state.conditionToEdit) return c;
                                else{ return newCondition
                                }
                            }),conditionForm_open:false,conditionForm_openForEdit:false}))
                            else{ //case of creating new condition
                                    this.setState(old=>({currConditions:old.currConditions.concat([newCondition]),conditionForm_open:false}))
                            }
                        }} onCancel={()=>{
                            this.setState({conditionForm_open:false})
                        }} 
                        initialValue={{param1:50/*param2:null*/,type:"gt",targetVar:"temp"}} />
                        </TouchableOpacity>

                    </TouchableOpacity>
                    
                </Modal>
                <Text style={text_options_group_style} >Automation options:</Text>
                 <View /*android_ripple={{radius:200,color:"#aaaaaa"}}*/
                  
                  style={{marginTop:6}}
                 >
                    
                     {false&&<Text style={text_option_key_style} >Start at</Text>}
                     {false&&<View style={{flexDirection:'row',marginBottom:4, justifyContent:"space-evenly",alignItems:"center"}} >
                     
                     
                     <TimeChip datetime={this.state.currentStartsAtDate} onClick={()=>{
                         DateTimePickerAndroid.open({mode: "time",
                            style:{backgroundColor:Palette.primary_2}, 
                            
                            value:this.state.currentStartsAtDate?this.state.currentStartsAtDate: new Date(Date.now()),
                            onChange:((e,date)=>{
                                if(!date)return;
                                this.setState(old=>{
                                    let originDT = old.currentStartsAtDate?old.currentStartsAtDate: new Date(Date.now())
                                    let newDT = new Date(Date.UTC(originDT.getUTCFullYear(),
                                    originDT.getUTCMonth(), originDT.getUTCDate(),date.getUTCHours(),
                                    date.getUTCMinutes()));
                                    
                                    return ({currentStartsAtDate:newDT});
                                }) 
                            ;})
                        });
                     }} />
                     <DateChip datetime={this.state.currentStartsAtDate} onClick={()=>{
                         DateTimePickerAndroid.open({mode: "date",
                            style:{backgroundColor:Palette.primary_2}, 
                            value: this.state.currentStartsAtDate?this.state.currentStartsAtDate: new Date(Date.now()),
                            onChange:((e,date)=>{
                                if(!date)return;
                                this.setState(old=>{
                                    let originDT = old.currentStartsAtDate?old.currentStartsAtDate: new Date(Date.now())
                                    let newDT = new Date(Date.UTC(date.getUTCFullYear(),
                                    date.getUTCMonth(), date.getUTCDate(),originDT.getUTCHours(),
                                    originDT.getUTCMinutes()));
                                    
                                    return ({currentStartsAtDate:newDT});
                                }) 
                            ;})
                        });
                     }} />

                     </View>}

                     <View style={{flexDirection:"row", paddingHorizontal:6,
                  justifyContent:"space-between",marginVertical:6}}>
                    <ValueKeyPressable key_icon={st.accessTime} value_textStyle={{fontSize:22}} wrapperStyle={{marginRight:14}}
                     unit='' valueUnitArray={TimeChip.formatTime2(this.state.currentStartsAtDate)} 
                    value='5:30 AM' title='Start time' onClick={()=>{
                        DateTimePickerAndroid.open({mode: "time",
                           style:{backgroundColor:Palette.primary_2}, 
                           
                           value:this.state.currentStartsAtDate?this.state.currentStartsAtDate: new Date(Date.now()),
                           onChange:((e,date)=>{
                               if(!date)return;
                               this.setState(old=>{
                                   let originDT = old.currentStartsAtDate?old.currentStartsAtDate: new Date(Date.now())
                                   let newDT = new Date(Date.UTC(originDT.getUTCFullYear(),
                                   originDT.getUTCMonth(), originDT.getUTCDate(),date.getUTCHours(),
                                   date.getUTCMinutes()));
                                   
                                   return ({currentStartsAtDate:newDT});
                               }) 
                           ;})
                       });
                    }}></ValueKeyPressable>
                    <ValueKeyPressable key_icon={st.scheduleMi} unit='' 
                    value_textStyle={{fontSize:17}} 
                    valueUnitArray={[DateChip.formatDate2(this.state.currentStartsAtDate)]} 
                    value='152,4'
                     title='Date' onClick={()=>{
                        DateTimePickerAndroid.open({mode: "date",
                           style:{backgroundColor:Palette.primary_2}, 
                           value: this.state.currentStartsAtDate?this.state.currentStartsAtDate: new Date(Date.now()),
                           onChange:((e,date)=>{
                               if(!date)return;
                               this.setState(old=>{
                                   let originDT = old.currentStartsAtDate?old.currentStartsAtDate: new Date(Date.now())
                                   let newDT = new Date(Date.UTC(date.getUTCFullYear(),
                                   date.getUTCMonth(), date.getUTCDate(),originDT.getUTCHours(),
                                   originDT.getUTCMinutes()));
                                   
                                   return ({currentStartsAtDate:newDT});
                               }) 
                           ;})
                       });
                    }}></ValueKeyPressable>


                 </View>
                     

                 </View>
                 <Hoz/>
                 <View style={{flexDirection:"row", paddingHorizontal:6,
                  justifyContent:"space-between",marginVertical:6}}>
                    <ValueKeyPressable key_icon={st.timelapse} 
                    wrapperStyle={{marginRight:14}} unit=''
                     valueUnitArray={FormatDuration(this.state.currDuration)} 
                    value='1h:30m' title='Duration' onClick={()=>{ 
                        this.openDurationPickerMi( durationAsDTypeMi, (res)=>{
                            if(res===null) return;
                            this.setState({currDuration:DurationTypeMiToSeconds(res)})
                        })
  
                    }}></ValueKeyPressable>
                    <ValueKeyPressable key_icon={st.autoRenew} unit='Day'
                     valueUnitArray={FormatDuration(this.state.currRepeatEvery)} 
                    value='152,4' title='Repeat every' onClick={()=>{ 
                        this.openDurationPickerMi(repeatEveryAsDTypeMi,(res)=>{
                            if(res===null) return;
                            this.setState({currRepeatEvery:DurationTypeMiToSeconds(res)})
                        })
  
                    }}></ValueKeyPressable>


                 </View>
                 
                
                 
                 
                 <Hoz/>
                 <View style={{marginTop:6}}>
                    <Text style={text_option_key_style} >Rules</Text>
                    <ConditionsEditor onRemove={(c)=>{
                         this.setState(old=>({
                            currConditions:old.currConditions.filter(it=>(!((it.targetVar==c.targetVar)&&(it.type==c.type)&&(it.param1==c.param1))))}))}}
                            onAddClick={(()=>{this.setState({conditionForm_open:true})}).bind(this)}
                            onEditOne={((targetCond:Conditon)=>{this.setState({conditionForm_open:true,
                                conditionForm_openForEdit:true,conditionToEdit:targetCond})}).bind(this)}
                            Conditions={this.state.currConditions} 
                    />
                 </View>
                 
            </View>
        )
    }
}



function Hoz(){
    return (
    <View style={{width:"80%", alignSelf:"center", height:1,backgroundColor:"#c9c9c9", marginVertical:0,}} ></View>
    )
}



type ManualControlSection_props = {

}
type ManualControlSection_state = {

}
export  class ManualControlSection extends Component<ManualControlSection_props, ManualControlSection_state>{
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render() {
        return (

            <View >
            </View>
        )
    }
}









const chipWraper : StyleProp<ViewStyle> = {
    elevation:1, borderRadius:100, height:28, 
     marginVertical:2, 
marginHorizontal:2, 
backgroundColor:Palette.lightHouse,
alignSelf:"flex-start",
alignItems:"center", justifyContent:"center"
}

const chipWraper_inner : StyleProp<ViewStyle> = {
    flexDirection:"row",
    alignItems:"center", 
justifyContent:"center",
paddingHorizontal:6, paddingLeft:6,
 paddingVertical:4,
}

const chip_text_style : StyleProp<TextStyle> = {
    color:Palette.lightsOutBlack,
    fontWeight:"700",
    fontSize:13,
    marginHorizontal:2
}



type TimeChip_props = {
    onClick:()=>void
    datetime:Date
}
type TimeChip_state = {
}
/**
 * trigger a time picker dlg. and is used to show time of the day at autoOptions>"start at" section
 * style should be constistent with ConditionCard
 */
export class TimeChip extends Component<TimeChip_props, TimeChip_state>{
    constructor(props:Readonly<TimeChip_props>) {
        super(props)
        this.state = {
        }
    }
    static twoDigits(n:number){
        return n<10?("0"+n):(""+n)
    }
    formatTime(dt:Date):string{
        if(!dt) return"non";
        
        console.log(dt);
        //return"ok";
        let h = Math.floor(dt.getHours());
        let s= "AM"
        if(h>=12){ h= h-12; s="PM"}
        if(h==0 ) h=12;
        return `${h}:${TimeChip.twoDigits(dt.getMinutes())} ${s}`
    }
    //used by KVP, returns array of values and units
    static formatTime2(dt:Date):string[]{
        if(!dt) return["non"];
                //return"ok";
        let h = Math.floor(dt.getHours());
        let s= "AM"
        if(h>=12){ h= h-12; s="PM"}
        if(h==0 ) h=12;
        return [ `${h}:${TimeChip.twoDigits(dt.getMinutes())}`,s];
    }
    render() {
        return (
            <TouchableHighlight style={chipWraper} underlayColor={"#aaaaaa"} onPress={this.props.onClick}>
                <View style={chipWraper_inner} >
                    <SvgMi size={16} style={{
                        marginRight: 6, borderRadius: 100, height: 16, width: 16,
                    }}
                        xmldata={st.accessTime}
                        color={Palette.inkDarkGrey} />
                    <View>
                        <Text style={chip_text_style} >{this.props.datetime?this.formatTime(this.props.datetime):"select time"}</Text>
                    </View>

                </View>

            </TouchableHighlight>
        )
    }
}







const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
const moths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

type DateChip_props = {
    onClick:()=>void
    datetime:Date
}
type DateChip_state = {
}
/**
 * trigger a date picker dlg. and is used to show date only at autoOptions>"start at" section
 */
export class DateChip extends Component<DateChip_props, DateChip_state>{
    constructor(props:Readonly<DateChip_props>) {
        super(props)
        this.state = {
        }
    }
    formatDate(dt:Date):string{
        if(!dt) return"non";
        //console.log(dt);
       // return"ok";
        return `${days[dt.getDay()]} ${dt.getDate()}/${dt.getMonth()+1}/${dt.getFullYear()}`
    }
    //used externally
    static formatDate2(dt:Date):string{
        if(!dt) return"non";
        //console.log(dt);
       // return"ok";
        return `${days[dt.getDay()]} ${dt.getDate()}/${dt.getMonth()+1}/${dt.getFullYear()}`
    }
    render() {
        return (
            <TouchableHighlight style={chipWraper} underlayColor={"#aaaaaa"} onPress={this.props.onClick}>
                <View style={chipWraper_inner} >
                    <SvgMi size={16} style={{
                        marginRight: 6, borderRadius: 100, height: 16, width: 16,
                    }}
                        xmldata={st.scheduleMi}
                        color={Palette.inkDarkGrey} />
                    <View>
                        <Text style={chip_text_style} >{this.props.datetime?this.formatDate(this.props.datetime):"Select date"}</Text>
                    </View>

                </View>

            </TouchableHighlight>
        )
    }
}



const bold_green_text = Palette.inkDarkGrey
const bold_green_text_4 = "#202725"
const bold_green_text_2 = "#0d541f"
const light_green_text = "#666666";
const light_green_text_4 = "#20272590";
const light_green_text_2 = "#50882390";
const light_green_bg = "#dfe7e2";
const light_green_bg_2 = "#dfe7e2";
const light_green_bg_1 = "ebedea";
//ATTEMPT at unifying the styles from Chip and KVP, keeping the chip/card look
const chipWraper_KVP : StyleProp<ViewStyle> = {
    elevation:1,
     borderRadius:100, height:64, 
     overflow:"hidden",
     marginVertical:2, 
     alignContent:"center",
     justifyContent:"center",
     alignItems:"center",
marginHorizontal:2, 
backgroundColor:Palette.whitePanel,
alignSelf:"flex-start",

}

const chipWraper_inner_KVP : StyleProp<ViewStyle> = {
    flexDirection:"row",
    alignItems:"center", 
justifyContent:"center",
paddingHorizontal:6, paddingLeft:6,
 paddingVertical:4,
}


const VKP_wrapper_default_style: StyleProp<ViewStyle>={
    flexDirection:"column",
    alignItems:"flex-start",
    padding:8,
    flex:1


}

const VKP_key_default_style: StyleProp<TextStyle>={
    fontSize:12,
    color:light_green_text,

}
const VKP_value_default_style: StyleProp<TextStyle>={
    fontSize:22,
    color: bold_green_text ,//"#508823",
    //fontFamily:"ABeeZee-Regular",
    fontWeight:"600",
    includeFontPadding:false,

    
}
const VKP_unit_default_style: StyleProp<TextStyle>={
    fontSize:14,
    color:light_green_text,
    marginHorizontal:2,
    marginBottom:2,
    includeFontPadding:true,
    
}

type ValueKeyPressable_props = {
    title:string
    key_icon?:string
    valueUnitArray:string[]
    value:string
    unit:string
    onClick:()=>void
    wrapperStyle?:StyleProp<ViewStyle>
    value_textStyle?:StyleProp<TextStyle>

}
type ValueKeyPressable_state = {
}
/**
 * the new created alternative in autoOptionsStyle2 (03-april-2022)
 */
export class ValueKeyPressable extends Component<ValueKeyPressable_props, ValueKeyPressable_state>{
    constructor(props:Readonly<ValueKeyPressable_props>) {
        super(props)
        this.state = {
        }
    }
    render() {
        return (
            <Pressable  style={[VKP_wrapper_default_style,chipWraper_KVP, this.props.wrapperStyle]} android_ripple={{ radius: 200, color: "#aaaaaa" }}
                onPress={this.props.onClick}
            >
                <View style={{flexDirection:"row",alignSelf:"center"}}>
                    {this.props.key_icon&&<SvgMi xmldata={this.props.key_icon} 
                    color={light_green_text} size={16} style={{
                        marginRight: 6, borderRadius: 100, height: 16, width: 16,
                    }} ></SvgMi>}
                    <Text style={VKP_key_default_style}  >{this.props.title}</Text>
                </View>
                <View style={{flexDirection:"row", alignSelf:"center", flex:1,alignItems:"flex-end",}}>
                    {this.props.valueUnitArray.map((s,ix)=>(
                    <Text key={ix} style={(ix%2)==0?[VKP_value_default_style,this.props.value_textStyle]:VKP_unit_default_style}>
                        {s}
                    </Text>
                    ))}
                    


                </View>


            </Pressable>
        )
    }
}