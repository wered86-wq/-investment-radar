import React,{useState,useEffect}from 'react';
import{View,Text,TextInput,TouchableOpacity,ScrollView,StyleSheet,Linking,Alert}from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import{useSafeAreaInsets}from 'react-native-safe-area-context';
import{C}from '../theme';
import{API_KEY_STORAGE}from '../api';

export default function SettingsScreen({onSave}){
  const insets=useSafeAreaInsets();
  const[key,setKey]=useState('');
  const[saved,setSaved]=useState(false);
  const[masked,setMasked]=useState(true);

  useEffect(()=>{
    AsyncStorage.getItem(API_KEY_STORAGE).then(v=>{if(v)setKey(v);});
  },[]);

  const save=async()=>{
    if(!key.trim()){Alert.alert('오류','API 키를 입력해주세요');return;}
    if(!key.trim().startsWith('AIza')){Alert.alert('확인','Gemini API 키는 AIza로 시작합니다.\n올바른 키인지 확인해주세요.');}
    await AsyncStorage.setItem(API_KEY_STORAGE,key.trim());
    setSaved(true);
    setTimeout(()=>{setSaved(false);if(onSave)onSave();},1200);
  };

  const clear=async()=>{
    Alert.alert('삭제','저장된 API 키를 삭제할까요?',[
      {text:'취소',style:'cancel'},
      {text:'삭제',style:'destructive',onPress:async()=>{
        await AsyncStorage.removeItem(API_KEY_STORAGE);
        setKey('');
      }},
    ]);
  };

  return(
    <ScrollView style={[s.root,{paddingTop:insets.top}]} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTop}><View style={s.dot}/><Text style={s.radar}>INVESTMENT RADAR</Text></View>
        <Text style={s.title}>⚙️ API 키 설정</Text>
        <Text style={s.sub}>Gemini API 키를 입력하면 검색 기능이 활성화됩니다</Text>
      </View>

      {/* Step 1 - Node.js */}
      <View style={s.stepCard}>
        <View style={s.stepHeader}>
          <View style={[s.stepNum,{backgroundColor:'#4da6ff22',borderColor:'#4da6ff44'}]}>
            <Text style={[s.stepNumTxt,{color:'#4da6ff'}]}>1</Text>
          </View>
          <Text style={s.stepTitle}>Node.js 설치 (PC 필요)</Text>
        </View>
        <Text style={s.stepDesc}>앱 빌드를 위해 PC에 Node.js가 필요합니다</Text>
        <TouchableOpacity style={s.linkBtn} onPress={()=>Linking.openURL('https://nodejs.org/ko')} activeOpacity={0.7}>
          <Text style={s.linkBtnTxt}>🌐 nodejs.org 바로가기 →</Text>
        </TouchableOpacity>
        <Text style={s.stepNote}>※ LTS 버전(초록색 버튼) 다운로드 후 설치</Text>
      </View>

      {/* Step 2 - Gemini API Key */}
      <View style={s.stepCard}>
        <View style={s.stepHeader}>
          <View style={[s.stepNum,{backgroundColor:'#00d4aa22',borderColor:'#00d4aa44'}]}>
            <Text style={[s.stepNumTxt,{color:'#00d4aa'}]}>2</Text>
          </View>
          <Text style={s.stepTitle}>Gemini API 키 발급 (무료)</Text>
        </View>
        <Text style={s.stepDesc}>구글 계정으로 무료 API 키를 발급받으세요</Text>
        <TouchableOpacity style={[s.linkBtn,{borderColor:'#00d4aa44',backgroundColor:'#00d4aa11'}]} onPress={()=>Linking.openURL('https://aistudio.google.com/app/apikey')} activeOpacity={0.7}>
          <Text style={[s.linkBtnTxt,{color:'#00d4aa'}]}>🔑 aistudio.google.com 바로가기 →</Text>
        </TouchableOpacity>
        <View style={s.howto}>
          <Text style={s.howtoItem}>① 구글 계정 로그인</Text>
          <Text style={s.howtoItem}>② "Create API Key" 버튼 클릭</Text>
          <Text style={s.howtoItem}>③ 생성된 키(AIza...)를 복사</Text>
          <Text style={s.howtoItem}>④ 아래 입력창에 붙여넣기</Text>
        </View>
      </View>

      {/* Step 3 - Input */}
      <View style={s.stepCard}>
        <View style={s.stepHeader}>
          <View style={[s.stepNum,{backgroundColor:'#f4c43022',borderColor:'#f4c43044'}]}>
            <Text style={[s.stepNumTxt,{color:'#f4c430'}]}>3</Text>
          </View>
          <Text style={s.stepTitle}>API 키 입력</Text>
        </View>
        <Text style={s.stepDesc}>복사한 API 키를 아래에 붙여넣어 저장하세요</Text>

        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={key}
            onChangeText={setKey}
            placeholder="AIza로 시작하는 키를 입력하세요"
            placeholderTextColor={C.muted}
            secureTextEntry={masked}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={()=>setMasked(v=>!v)} style={s.eyeBtn}>
            <Text style={s.eyeTxt}>{masked?'👁':'🙈'}</Text>
          </TouchableOpacity>
        </View>

        {key.length>0&&(
          <Text style={[s.keyStatus,{color:key.startsWith('AIza')?'#00d4aa':'#f4c430'}]}>
            {key.startsWith('AIza')?'✓ 올바른 형식의 키입니다':'⚠ AIza로 시작하는지 확인하세요'}
          </Text>
        )}

        <TouchableOpacity onPress={save} activeOpacity={0.8}
          style={[s.saveBtn,saved&&{backgroundColor:'#00b08a'}]}>
          <Text style={s.saveBtnTxt}>{saved?'✓ 저장 완료!':'💾 저장하기'}</Text>
        </TouchableOpacity>

        {key.length>0&&(
          <TouchableOpacity onPress={clear} activeOpacity={0.7} style={s.clearBtn}>
            <Text style={s.clearBtnTxt}>🗑 키 삭제</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Info */}
      <View style={s.infoCard}>
        <Text style={s.infoTitle}>💡 Gemini 무료 플랜 정보</Text>
        <Text style={s.infoItem}>• 하루 1,500번 무료 요청 가능</Text>
        <Text style={s.infoItem}>• 신용카드 등록 불필요</Text>
        <Text style={s.infoItem}>• 구글 계정만 있으면 발급 가능</Text>
        <Text style={s.infoItem}>• 키는 이 기기에만 저장되며 외부로 전송되지 않습니다</Text>
      </View>
    </ScrollView>
  );
}

const s=StyleSheet.create({
  root:{flex:1,backgroundColor:'#0a0c10'},
  content:{padding:18,paddingBottom:60},
  header:{marginBottom:20},
  headerTop:{flexDirection:'row',alignItems:'center',gap:7,marginBottom:4},
  dot:{width:7,height:7,borderRadius:4,backgroundColor:'#00d4aa'},
  radar:{fontSize:9,letterSpacing:2,color:'#00d4aa',fontWeight:'700'},
  title:{fontSize:22,fontWeight:'800',color:'#ffffff',marginBottom:4},
  sub:{fontSize:13,color:'#6b7a99',lineHeight:20},
  stepCard:{backgroundColor:'#161b24',borderWidth:1,borderColor:'#1e2535',borderRadius:14,padding:16,marginBottom:12},
  stepHeader:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:10},
  stepNum:{width:32,height:32,borderRadius:8,borderWidth:1,justifyContent:'center',alignItems:'center'},
  stepNumTxt:{fontSize:15,fontWeight:'800'},
  stepTitle:{fontSize:15,fontWeight:'700',color:'#ffffff',flex:1},
  stepDesc:{fontSize:13,color:'#6b7a99',marginBottom:12,lineHeight:19},
  linkBtn:{backgroundColor:'#4da6ff11',borderWidth:1,borderColor:'#4da6ff44',borderRadius:10,padding:13,alignItems:'center',marginBottom:10},
  linkBtnTxt:{color:'#4da6ff',fontWeight:'700',fontSize:13},
  stepNote:{fontSize:11,color:'#6b7a99'},
  howto:{backgroundColor:'#0a0c10',borderRadius:8,padding:12,gap:5},
  howtoItem:{fontSize:13,color:'#e8eaf0',lineHeight:22},
  inputRow:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:8},
  input:{flex:1,backgroundColor:'#0a0c10',borderWidth:1,borderColor:'#1e2535',borderRadius:10,padding:13,color:'#ffffff',fontSize:13,fontFamily:'monospace'},
  eyeBtn:{padding:10},
  eyeTxt:{fontSize:18},
  keyStatus:{fontSize:12,marginBottom:10,fontWeight:'600'},
  saveBtn:{backgroundColor:'#00d4aa',borderRadius:12,padding:14,alignItems:'center',marginBottom:8},
  saveBtnTxt:{color:'#001a14',fontWeight:'800',fontSize:15},
  clearBtn:{borderWidth:1,borderColor:'#ff4d6d44',borderRadius:10,padding:11,alignItems:'center'},
  clearBtnTxt:{color:'#ff4d6d',fontWeight:'600',fontSize:13},
  infoCard:{backgroundColor:'#1a2030',borderWidth:1,borderColor:'#1e2535',borderRadius:14,padding:16,marginTop:4},
  infoTitle:{fontSize:13,fontWeight:'700',color:'#f4c430',marginBottom:10},
  infoItem:{fontSize:12,color:'#6b7a99',lineHeight:22},
});
