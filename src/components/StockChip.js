import React,{useState}from 'react';
import{View,Text,TouchableOpacity,Modal,TouchableWithoutFeedback,StyleSheet}from 'react-native';
import{C}from '../theme';
export default function StockChip({stock}){
  const[show,setShow]=useState(false);
  const isUS=stock.market==='US';
  return(<>
    <TouchableOpacity onPress={()=>setShow(true)} activeOpacity={0.7}
      style={[s.chip,{backgroundColor:isUS?C.usCard:C.krCard,borderColor:isUS?'#4da6ff44':'#00d4aa44'}]}>
      <Text style={s.flag}>{isUS?'🇺🇸':'🇰🇷'}</Text>
      <View><Text style={s.ticker}>{stock.ticker}</Text><Text style={s.name} numberOfLines={1}>{stock.name}</Text></View>
    </TouchableOpacity>
    <Modal visible={show} transparent animationType="fade" onRequestClose={()=>setShow(false)}>
      <TouchableWithoutFeedback onPress={()=>setShow(false)}>
        <View style={s.overlay}>
          <TouchableWithoutFeedback>
            <View style={s.tip}>
              <Text style={s.tipTitle}>{isUS?'🇺🇸':'🇰🇷'} {stock.ticker} — {stock.name}</Text>
              <Text style={s.tipBody}>{stock.reason}</Text>
              <TouchableOpacity onPress={()=>setShow(false)} style={s.tipBtn}><Text style={s.tipBtnTxt}>닫기</Text></TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  </>);
}
const s=StyleSheet.create({
  chip:{flexDirection:'row',alignItems:'center',gap:6,borderWidth:1,borderRadius:8,paddingVertical:7,paddingHorizontal:10},
  flag:{fontSize:14},ticker:{fontSize:12,fontWeight:'700',color:'#ffffff',lineHeight:16},
  name:{fontSize:10,color:'#6b7a99',lineHeight:14,maxWidth:80},
  overlay:{flex:1,backgroundColor:'#000000aa',justifyContent:'center',alignItems:'center',padding:30},
  tip:{backgroundColor:'#1e2a40',borderWidth:1,borderColor:'#4da6ff55',borderRadius:14,padding:18,width:'100%',maxWidth:320},
  tipTitle:{fontSize:13,fontWeight:'700',color:'#ffffff',marginBottom:8},
  tipBody:{fontSize:13,color:'#e8eaf0',lineHeight:20},
  tipBtn:{marginTop:14,backgroundColor:'#4da6ff22',borderRadius:8,padding:10,alignItems:'center'},
  tipBtnTxt:{color:'#4da6ff',fontWeight:'700',fontSize:13},
});
