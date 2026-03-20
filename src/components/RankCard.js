import React,{useState}from 'react';
import{View,Text,TouchableOpacity,StyleSheet}from 'react-native';
import{C,RANK_COLORS,RANK_LABELS,SOURCE_META}from '../theme';
import StockChip from './StockChip';
export default function RankCard({item,index}){
  const[exp,setExp]=useState(false);
  const isTop3=index<3;const rc=RANK_COLORS[index];const sm=SOURCE_META[item.sourceType]||SOURCE_META.mixed;
  return(
    <TouchableOpacity onPress={()=>setExp(v=>!v)} activeOpacity={0.85} style={[s.card,{borderColor:isTop3?rc+'66':C.border}]}>
      {isTop3&&<View style={[s.topBar,{backgroundColor:rc}]}/>}
      <View style={s.row}>
        <View style={[s.badge,{backgroundColor:rc+'22',borderColor:rc+'44'}]}>
          <Text style={[s.badgeTxt,{color:rc,fontSize:isTop3?20:14}]}>{isTop3?RANK_LABELS[index]:index+1}</Text>
        </View>
        <View style={s.main}>
          <View style={s.titleRow}>
            <Text style={s.topic} numberOfLines={1}>{item.topic}</Text>
            <View style={[s.src,{backgroundColor:sm.color+'22',borderColor:sm.color+'44'}]}>
              <Text style={[s.srcTxt,{color:sm.color}]}>{sm.label}</Text>
            </View>
          </View>
          <Text style={s.summary} numberOfLines={2}>{item.summary}</Text>
          <View style={s.barRow}>
            <View style={s.barBg}><View style={[s.barFill,{width:`${item.score}%`}]}/></View>
            <Text style={s.scoreNum}>{item.score}</Text>
          </View>
        </View>
        <View style={s.scoreBox}>
          <Text style={s.scoreLabel}>관심지수</Text>
          <Text style={[s.scoreBig,{color:rc}]}>{item.score}</Text>
        </View>
      </View>
      {item.stocks&&item.stocks.length>0&&(
        <View style={s.stocks}>
          <Text style={s.stocksLabel}>📈 대장주 <Text style={s.hint2}>탭→이유</Text></Text>
          <View style={s.chips}>{item.stocks.map((st,i)=><StockChip key={i} stock={st}/>)}</View>
        </View>
      )}
      {exp&&item.details&&(
        <View style={s.detail}>
          <View style={[s.detailBox,{backgroundColor:C.usCard}]}>
            <Text style={[s.detailTitle,{color:C.blue}]}>🇺🇸 미국 투자기관</Text>
            {(item.details.us||[]).map((d,i)=><Text key={i} style={s.detailItem}>• {d}</Text>)}
          </View>
          <View style={[s.detailBox,{backgroundColor:C.krCard}]}>
            <Text style={[s.detailTitle,{color:C.accent}]}>🇰🇷 국내 투자기관</Text>
            {(item.details.kr||[]).map((d,i)=><Text key={i} style={s.detailItem}>• {d}</Text>)}
          </View>
          {item.details.sources&&(
            <View style={[s.detailBox,{backgroundColor:'#1e2535'}]}>
              <Text style={[s.detailTitle,{color:C.gold}]}>📰 출처</Text>
              {item.details.sources.map((src,i)=><Text key={i} style={[s.detailItem,{color:C.muted}]}>• {src}</Text>)}
            </View>
          )}
        </View>
      )}
      <Text style={s.hint}>{exp?'▲ 접기':'▼ 기관 분석 보기'}</Text>
    </TouchableOpacity>
  );
}
const s=StyleSheet.create({
  card:{backgroundColor:'#161b24',borderWidth:1,borderRadius:14,padding:14,marginBottom:10,overflow:'hidden',position:'relative'},
  topBar:{position:'absolute',top:0,left:0,right:0,height:2},
  row:{flexDirection:'row',alignItems:'flex-start',gap:12},
  badge:{width:40,height:40,borderRadius:10,borderWidth:1,justifyContent:'center',alignItems:'center',flexShrink:0},
  badgeTxt:{fontWeight:'700'},main:{flex:1},
  titleRow:{flexDirection:'row',alignItems:'center',gap:7,marginBottom:3,flexWrap:'wrap'},
  topic:{fontSize:14,fontWeight:'700',color:'#ffffff',flexShrink:1},
  src:{borderWidth:1,borderRadius:4,paddingHorizontal:6,paddingVertical:2},
  srcTxt:{fontSize:10,fontWeight:'700'},
  summary:{fontSize:12,color:'#6b7a99',lineHeight:18,marginBottom:7},
  barRow:{flexDirection:'row',alignItems:'center',gap:8},
  barBg:{flex:1,height:4,backgroundColor:'#1e2535',borderRadius:2,overflow:'hidden'},
  barFill:{height:'100%',backgroundColor:'#00d4aa',borderRadius:2},
  scoreNum:{fontSize:12,color:'#00d4aa',fontWeight:'700',minWidth:26},
  scoreBox:{alignItems:'flex-end',flexShrink:0,paddingLeft:4},
  scoreLabel:{fontSize:10,color:'#6b7a99',marginBottom:2},
  scoreBig:{fontSize:22,fontWeight:'800',lineHeight:24},
  stocks:{marginTop:11,paddingTop:11,borderTopWidth:1,borderTopColor:'#1e2535'},
  stocksLabel:{fontSize:11,color:'#f4c430',fontWeight:'700',marginBottom:7},
  hint2:{fontSize:10,color:'#6b7a99',fontWeight:'400'},
  chips:{flexDirection:'row',flexWrap:'wrap',gap:7},
  detail:{marginTop:12,paddingTop:12,borderTopWidth:1,borderTopColor:'#1e2535',gap:8},
  detailBox:{borderRadius:9,padding:11},
  detailTitle:{fontSize:11,fontWeight:'700',marginBottom:5},
  detailItem:{fontSize:12,color:'#e8eaf0',marginBottom:3},
  hint:{textAlign:'center',marginTop:9,fontSize:11,color:'#6b7a99'},
});
