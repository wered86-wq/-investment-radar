import React,{useState,useEffect,useRef}from 'react';
import{View,Text,TouchableOpacity,ScrollView,StyleSheet,ActivityIndicator,Alert,Animated,RefreshControl}from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import{useSafeAreaInsets}from 'react-native-safe-area-context';
import{C,RANK_LABELS}from '../theme';
import RankCard from '../components/RankCard';
import{fetchInvestmentThemes,API_KEY_STORAGE}from '../api';
import SettingsScreen from './SettingsScreen';

const HISTORY_KEY='inv_radar_v4';

export default function HomeScreen(){
  const insets=useSafeAreaInsets();
  const[tab,setTab]=useState('result');
  const[results,setResults]=useState([]);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState(null);
  const[date,setDate]=useState('');
  const[history,setHistory]=useState([]);
  const[hasKey,setHasKey]=useState(false);
  const fade=useRef(new Animated.Value(0)).current;

  useEffect(()=>{
    // 저장된 기록 불러오기
    AsyncStorage.getItem(HISTORY_KEY).then(v=>{
      if(!v)return;
      try{const h=JSON.parse(v);setHistory(h);if(h.length>0){setResults(h[0].results);setDate(h[0].date);animIn();}}catch(_){}
    });
    // API 키 여부 확인
    checkKey();
  },[]);

  const checkKey=async()=>{
    const k=await AsyncStorage.getItem(API_KEY_STORAGE);
    setHasKey(!!(k&&k.trim()));
  };

  const animIn=()=>{fade.setValue(0);Animated.timing(fade,{toValue:1,duration:500,useNativeDriver:true}).start();};

  const doSearch=async()=>{
    const k=await AsyncStorage.getItem(API_KEY_STORAGE);
    if(!k||!k.trim()){
      Alert.alert('API 키 필요','설정 탭에서 Gemini API 키를 먼저 입력해주세요',[
        {text:'취소',style:'cancel'},
        {text:'설정으로 이동',onPress:()=>setTab('settings')},
      ]);
      return;
    }
    setLoading(true);setError(null);
    try{
      const themes=await fetchInvestmentThemes();
      const sorted=themes.sort((a,b)=>b.score-a.score).slice(0,10);
      const d=new Date().toLocaleString('ko-KR');
      const entry={date:d,results:sorted};
      const h=[entry,...history].slice(0,10);
      setResults(sorted);setDate(d);setHistory(h);setTab('result');
      await AsyncStorage.setItem(HISTORY_KEY,JSON.stringify(h));
      animIn();
    }catch(e){
      if(e.message==='API_KEY_NOT_SET'){
        setError('API 키가 설정되지 않았습니다.\n설정 탭에서 키를 입력해주세요.');
      }else{
        setError(e.message||'오류');
      }
    }
    finally{setLoading(false);}
  };

  const loadItem=h=>{setResults(h.results);setDate(h.date);setTab('result');animIn();};
  const delItem=idx=>{
    Alert.alert('삭제','이 기록을 삭제할까요?',[
      {text:'취소',style:'cancel'},
      {text:'삭제',style:'destructive',onPress:async()=>{const h=history.filter((_,i)=>i!==idx);setHistory(h);await AsyncStorage.setItem(HISTORY_KEY,JSON.stringify(h));}},
    ]);
  };

  const TABS=[
    {id:'result',l:'📊 결과'},
    {id:'history',l:`📂 기록${history.length>0?` (${history.length})`:''}` },
    {id:'settings',l:'⚙️ 설정'},
  ];

  return(
    <View style={[st.root,{paddingTop:insets.top}]}>
      {/* Header */}
      <View style={st.header}>
        <View>
          <View style={st.headerTop}><View style={st.dot}/><Text style={st.radar}>INVESTMENT RADAR</Text></View>
          <Text style={st.title}>글로벌 투자기관 분석기</Text>
          <Text style={st.sub}>미국 × 국내 기관 공통 테마 + 대장주 TOP 10</Text>
        </View>
        <TouchableOpacity onPress={doSearch} disabled={loading} activeOpacity={0.8}
          style={[st.searchBtn,loading&&st.searchBtnOff]}>
          {loading?<ActivityIndicator size="small" color="#00d4aa"/>:<Text style={st.searchTxt}>🔍 검색</Text>}
        </TouchableOpacity>
      </View>

      {/* API 키 미설정 배너 */}
      {!hasKey&&tab!=='settings'&&(
        <TouchableOpacity onPress={()=>setTab('settings')} style={st.keyBanner} activeOpacity={0.8}>
          <Text style={st.keyBannerTxt}>⚠️ API 키 미설정 — 여기를 탭해서 설정하세요 →</Text>
        </TouchableOpacity>
      )}

      {/* Legend */}
      <View style={st.legend}>
        {[{l:'미국기관',w:'40%',c:'#4da6ff'},{l:'국내기관',w:'40%',c:'#00d4aa'},{l:'멀티소스',w:'20%',c:'#f4c430'}].map(x=>(
          <View key={x.l} style={st.legItem}><View style={[st.legDot,{backgroundColor:x.c}]}/><Text style={st.legLabel}>{x.l}</Text><Text style={[st.legW,{color:x.c}]}>{x.w}</Text></View>
        ))}
      </View>

      {/* Tabs */}
      <View style={st.tabs}>
        {TABS.map(t=>(
          <TouchableOpacity key={t.id} onPress={()=>setTab(t.id)} activeOpacity={0.7}
            style={[st.tab,tab===t.id&&st.tabOn]}>
            <Text style={[st.tabTxt,tab===t.id&&st.tabTxtOn]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Settings Tab */}
      {tab==='settings'&&(
        <SettingsScreen onSave={()=>{checkKey();setTab('result');}}/>
      )}

      {/* Result Tab */}
      {tab==='result'&&(
        <ScrollView style={st.scroll} contentContainerStyle={st.scrollC} showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={doSearch} tintColor="#00d4aa"/>}>
          {!loading&&results.length===0&&!error&&(
            <View style={st.empty}>
              <Text style={st.emptyIcon}>📡</Text>
              <Text style={st.emptyTitle}>검색을 시작해보세요</Text>
              <Text style={st.emptyDesc}>
                {hasKey
                  ? '검색 버튼을 누르면\n미국·국내 투자기관 공통 테마를 분석합니다'
                  : '⚙️ 설정 탭에서 API 키를 먼저 입력해주세요'}
              </Text>
              {!hasKey&&(
                <TouchableOpacity onPress={()=>setTab('settings')} style={st.startBtn} activeOpacity={0.8}>
                  <Text style={st.startTxt}>⚙️ API 키 설정하러 가기</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {loading&&(<View style={st.loading}><ActivityIndicator size="large" color="#00d4aa"/><Text style={st.loadTxt}>⚡ 테마 · 대장주 분석 중...</Text><Text style={st.loadSub}>잠시만 기다려주세요</Text></View>)}
          {error&&(
            <View style={st.errBox}>
              <Text style={st.errTitle}>⚠️ 오류 발생</Text>
              <Text style={st.errMsg}>{error}</Text>
              <View style={{flexDirection:'row',gap:8,marginTop:14}}>
                <TouchableOpacity onPress={doSearch} style={[st.retryBtn,{flex:1}]} activeOpacity={0.8}><Text style={st.retryTxt}>다시 시도</Text></TouchableOpacity>
                <TouchableOpacity onPress={()=>setTab('settings')} style={[st.retryBtn,{flex:1,borderColor:'#00d4aa44',backgroundColor:'#00d4aa11'}]} activeOpacity={0.8}><Text style={[st.retryTxt,{color:'#00d4aa'}]}>설정</Text></TouchableOpacity>
              </View>
            </View>
          )}
          {results.length>0&&(
            <Animated.View style={{opacity:fade}}>
              <View style={st.resHeader}><Text style={st.resDate}>🕐 {date}</Text><View style={st.topBadge}><Text style={st.topBadgeTxt}>TOP 10</Text></View></View>
              {results.map((item,i)=><RankCard key={i} item={item} index={i}/>)}
              <View style={st.footnote}><Text style={st.footTxt}><Text style={st.footGold}>📊 랭킹 기준 </Text>미국기관 40% + 국내기관 40% + 멀티소스 20%.</Text></View>
            </Animated.View>
          )}
        </ScrollView>
      )}

      {/* History Tab */}
      {tab==='history'&&(
        <ScrollView style={st.scroll} contentContainerStyle={st.scrollC} showsVerticalScrollIndicator={false}>
          <View style={st.histHead}>
            <Text style={st.histTitle}>📂 최근 검색 기록</Text>
            {history.length>0&&<TouchableOpacity onPress={()=>{Alert.alert('전체 삭제','모두 삭제할까요?',[{text:'취소',style:'cancel'},{text:'삭제',style:'destructive',onPress:async()=>{setHistory([]);await AsyncStorage.removeItem(HISTORY_KEY);}}]);}}><Text style={st.clearAll}>전체 삭제</Text></TouchableOpacity>}
          </View>
          {history.length===0?(
            <View style={st.empty}><Text style={st.emptyIcon}>📭</Text><Text style={st.emptyTitle}>기록이 없습니다</Text><Text style={st.emptyDesc}>검색하면 여기에 자동 저장됩니다</Text></View>
          ):history.map((h,i)=>(
            <View key={i} style={st.hCard}>
              <TouchableOpacity onPress={()=>loadItem(h)} activeOpacity={0.8} style={st.hBody}>
                <View style={st.hTop}><Text style={st.hDate}>🕐 {h.date}</Text><View style={st.topBadge}><Text style={st.topBadgeTxt}>TOP {h.results.length}</Text></View></View>
                {h.results.slice(0,5).map((r,j)=>(
                  <View key={j} style={st.hRow}><Text style={st.hRank}>{RANK_LABELS[j]}</Text><Text style={st.hTopic} numberOfLines={1}>{r.topic}</Text><Text style={st.hTickers} numberOfLines={1}>{(r.stocks||[]).slice(0,2).map(s=>s.ticker).join('·')}</Text></View>
                ))}
                {h.results.length>5&&<Text style={st.hMore}>+{h.results.length-5}개 →</Text>}
                <Text style={st.hLoad}>탭하여 불러오기 →</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>delItem(i)} style={st.hDel} activeOpacity={0.7}><Text style={st.hDelTxt}>🗑 이 기록 삭제</Text></TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const st=StyleSheet.create({
  root:{flex:1,backgroundColor:'#0a0c10'},
  header:{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',paddingHorizontal:18,paddingTop:10,paddingBottom:6},
  headerTop:{flexDirection:'row',alignItems:'center',gap:7,marginBottom:2},
  dot:{width:7,height:7,borderRadius:4,backgroundColor:'#00d4aa'},
  radar:{fontSize:9,letterSpacing:2,color:'#00d4aa',fontWeight:'700'},
  title:{fontSize:20,fontWeight:'800',color:'#ffffff'},
  sub:{fontSize:12,color:'#6b7a99',marginTop:2},
  searchBtn:{backgroundColor:'#00d4aa',borderRadius:12,paddingVertical:11,paddingHorizontal:20,marginTop:4},
  searchBtnOff:{backgroundColor:'#1e2535'},
  searchTxt:{color:'#001a14',fontWeight:'800',fontSize:14},
  keyBanner:{backgroundColor:'#f4c43022',borderWidth:1,borderColor:'#f4c43044',marginHorizontal:18,borderRadius:10,padding:10,marginBottom:4},
  keyBannerTxt:{color:'#f4c430',fontSize:12,fontWeight:'600',textAlign:'center'},
  legend:{flexDirection:'row',paddingHorizontal:18,gap:14,marginBottom:8},
  legItem:{flexDirection:'row',alignItems:'center',gap:5},
  legDot:{width:8,height:8,borderRadius:2},
  legLabel:{fontSize:11,color:'#6b7a99'},
  legW:{fontSize:11,fontWeight:'700'},
  tabs:{flexDirection:'row',gap:6,paddingHorizontal:18,marginBottom:4},
  tab:{flex:1,paddingVertical:9,borderRadius:10,borderWidth:1,borderColor:'#1e2535',alignItems:'center'},
  tabOn:{backgroundColor:'#00d4aa18',borderColor:'#00d4aa66'},
  tabTxt:{fontSize:12,fontWeight:'700',color:'#6b7a99'},
  tabTxtOn:{color:'#00d4aa'},
  scroll:{flex:1},scrollC:{padding:14,paddingBottom:80},
  empty:{alignItems:'center',paddingVertical:70},
  emptyIcon:{fontSize:52,marginBottom:16},
  emptyTitle:{fontSize:17,fontWeight:'700',color:'#6b7a99',marginBottom:8},
  emptyDesc:{fontSize:13,color:'#3a4558',textAlign:'center',lineHeight:22},
  startBtn:{marginTop:20,backgroundColor:'#00d4aa',borderRadius:14,paddingVertical:14,paddingHorizontal:30},
  startTxt:{color:'#001a14',fontWeight:'800',fontSize:15},
  loading:{alignItems:'center',paddingVertical:70,gap:12},
  loadTxt:{fontSize:14,color:'#00d4aa',fontWeight:'700'},
  loadSub:{fontSize:12,color:'#6b7a99'},
  errBox:{backgroundColor:'#ff4d6d11',borderWidth:1,borderColor:'#ff4d6d44',borderRadius:14,padding:22,alignItems:'center'},
  errTitle:{fontSize:15,color:'#ff4d6d',fontWeight:'700',marginBottom:7},
  errMsg:{fontSize:12,color:'#6b7a99',textAlign:'center',marginBottom:4},
  retryBtn:{backgroundColor:'#ff4d6d22',borderWidth:1,borderColor:'#ff4d6d44',borderRadius:10,paddingVertical:11,alignItems:'center'},
  retryTxt:{color:'#ff4d6d',fontWeight:'700',fontSize:13},
  resHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:13},
  resDate:{fontSize:12,color:'#6b7a99'},
  topBadge:{backgroundColor:'#00d4aa18',borderWidth:1,borderColor:'#00d4aa44',borderRadius:6,paddingHorizontal:10,paddingVertical:3},
  topBadgeTxt:{fontSize:11,color:'#00d4aa',fontWeight:'700'},
  footnote:{marginTop:20,padding:15,backgroundColor:'#161b24',borderRadius:12,borderWidth:1,borderColor:'#1e2535'},
  footTxt:{fontSize:11,color:'#6b7a99',lineHeight:18},
  footGold:{color:'#f4c430',fontWeight:'700'},
  histHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14},
  histTitle:{fontSize:15,fontWeight:'700',color:'#ffffff'},
  clearAll:{fontSize:13,color:'#ff4d6d',fontWeight:'700'},
  hCard:{backgroundColor:'#161b24',borderWidth:1,borderColor:'#1e2535',borderRadius:14,marginBottom:10,overflow:'hidden'},
  hBody:{padding:14},
  hTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:10},
  hDate:{fontSize:12,color:'#00d4aa',fontWeight:'700'},
  hRow:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:5},
  hRank:{fontSize:13,minWidth:24},
  hTopic:{fontSize:13,fontWeight:'600',color:'#e8eaf0',flex:1},
  hTickers:{fontSize:11,color:'#6b7a99'},
  hMore:{fontSize:12,color:'#6b7a99',marginLeft:24,marginTop:2},
  hLoad:{fontSize:12,color:'#00d4aa',fontWeight:'600',marginTop:10},
  hDel:{borderTopWidth:1,borderTopColor:'#1e2535',padding:11,alignItems:'center'},
  hDelTxt:{fontSize:13,color:'#ff4d6d',fontWeight:'600'},
});
