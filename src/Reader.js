/* Reader base from osu-packet! */
const OsuBuffer = require('osu-buffer');

class Reader {
    constructor() {
    }
  
    /**
     * Reads a set of data from a buffer
     * @param {OsuBuffer} buff
     * @param {Object} layout
     * @param {null|Number|Boolean|Object|Array|String} requires
     * @param {Object|Array} data
     * @return {Object|Array}
     */
    Read(buff, layout, data = {}) {
      switch (layout.type.toLowerCase()) {
        case 'int8':
          data = buff.readInt8();
          break;
        case 'uint8':
          data = buff.readUint8();
          break;
        case 'int16':
          data = buff.readInt16();
          break;
        case 'uint16':
          data = buff.readUint16();
          break;
        case 'int32':
          data = buff.readInt32();
          break;
        case 'uint32':
          data = buff.readUint32();
          break;
        case 'int64':
          data = buff.readInt64();
          break;
        case 'uint64':
          data = buff.readUint64();
          break;
        case 'string':
          data = buff.readString();
          break;
        case 'float':
          data = buff.readFloat();
          break;
        case 'double':
          data = buff.readDouble();
          break;
        case 'boolean':
          data = buff.readBoolean();
          break;
        case 'byte':
          data = buff.readBytes(1);
          break;
        case 'int32array': {
          let len = buff.readInt16();
          data = [];
          for (let i = 0; i < len; i++) {
            data.push(buff.readInt32());
          }
          break;
        }
        case "collections": {
          let collectionsCount = data['collectionscount'];
          data = [];
          for (let i=0; i < collectionsCount; i++) {
            let collection = {
              'name': buff.readString(),
              'beatmapsCount': buff.readInt32(),
              'beatmapsMd5': []
            }

            for (let i=0; i<collection['beatmapsCount']; i++) {
              let bmmd5 = buff.readString();
              collection['beatmapsMd5'].push(bmmd5)
            }

            data.push(collection);
          }
          break;
        }

        case "scorebeatmaps": {
          let beatmaps = data['beatmaps_count'];
          data = [];
          for (let i=0; i < beatmaps; i++) {
            let beatmapData = {
              'hash': buff.readString(),
              'amountScores': buff.readInt32(),
              'scores': []
            }

            for (let i=0; i<beatmapData['amountScores']; i++) {
              let scoreData = {
                "mode": buff.readBytes(1),
                "version":  buff.readInt32(),
                "beatmapHash": buff.readString(),
                "playerName": buff.readString(),
                "replayHash": buff.readString(),
                "amount300": buff.readInt16(),
                "amount100": buff.readInt16(),
                "amount50": buff.readInt16(),
                "amountGekis": buff.readInt16(),
                "amountKatus": buff.readInt16(),
                "amountMisses": buff.readInt16(),
                "score":  buff.readInt32(),
                "maxcombo":  buff.readInt16(),
                "perfectboolean":  buff.readBoolean(),
                "mods":  buff.readInt32(),
                "alwaysEmpty": buff.readString(),
                "timestamp": buff.readDateTime().toString(),
                "always-1":  buff.readInt32(),
                "scoreID":  buff.readUint64().toString(),
                // "additionalMods": buff.ReadDouble(),
              }
              // console.log(scoreData)
              beatmapData['scores'].push(scoreData)
            }
            //console.log(beatmapData)
            data.push(beatmapData);
          }
          break;
        }

        case "beatmaps": {
            let osuver = data['osuver'];
            let beatmapscount = data['beatmaps_count'];
           
            data = [];
            for (let i = 0; i < beatmapscount; i++) {
                if (osuver < 20191107) {
                  buff.readInt32(); // entry size xd
                }
                let beatmap = {
                  'artist_name': buff.readString(),
                  'artist_name_unicode': buff.readString(),
                  'song_title': buff.readString(),
                  'song_title_unicode': buff.readString(),
                  'creator_name': buff.readString(),
                  'difficulty': buff.readString(),
                  'audio_file_name': buff.readString(),
                  'md5': buff.readString(),
                  'osu_file_name': buff.readString(),
                  'ranked_status': buff.readBytes(1),
                  'n_hitcircles': buff.readInt16(),
                  'n_sliders': buff.readInt16(),
                  'n_spinners': buff.readInt16(),
                  'last_modification_time': buff.readInt64()
                }
               
                if (osuver < 20140609) {
                  beatmap = {
                    ...beatmap,
                    'approach_rate': buff.readBytes(1),
                    'circle_size': buff.readBytes(1),
                    'hp_drain': buff.readBytes(1),
                    'overall_difficulty': buff.readBytes(1)
                  }
                } else {
                  beatmap = {
                    ...beatmap,
                    'approach_rate': buff.readFloat(),
                    'circle_size': buff.readFloat(),
                    'hp_drain': buff.readFloat(),
                    'overall_difficulty': buff.readFloat()
                  }
                }

                beatmap['slider_velocity'] = buff.readDouble()
                
                if (osuver >= 20140609) {
                  let difficulties = []
                  
                  for(let i = 0; i<4; i++) {
                    let length = buff.readInt32()
                    let diffs = {}
                    for(let i=0; i<length; i++) {
                        buff.readBytes(1)
                        let mode = buff.readInt32();
                        buff.readBytes(1);
                        let diff = buff.readFloat();
                        diffs[mode] = diff
                    }
                    difficulties.push(diffs)
                  } 

                  beatmap = {
                    ...beatmap,
                    'star_rating_standard': difficulties[0],
                    'star_rating_taiko': difficulties[1],
                    'star_rating_ctb': difficulties[2],
                    'star_rating_mania': difficulties[3],
                  }
                }         
                
                beatmap = {
                  ...beatmap,
                  'drain_time': buff.readInt32(),
                  'total_time': buff.readInt32(),
                  'preview_offset': buff.readInt32(),
                }

                let timingPoints = [];
                let timingPointsLength = buff.readInt32()
                for (let i = 0; i < timingPointsLength; i++) {
                  timingPoints.push([
                    buff.readDouble(), //BPM
                    buff.readDouble(), // offset
                    buff.readBoolean() // Boolean
                  ])
                }

                beatmap = {
                  ...beatmap,
                  'beatmap_id': buff.readInt32(),
                  'beatmapset_id': buff.readInt32(),
                  'thread_id': buff.readInt32(),
                  'grade_standard': buff.readBytes(1),
                  'grade_taiko': buff.readBytes(1),
                  'grade_ctb': buff.readBytes(1),
                  'grade_mania': buff.readBytes(1),
                  'local_beatmap_offset': buff.readInt16(),
                  'stack_leniency': buff.readFloat(),
                  'timing_points': timingPoints,
                  'mode': buff.readBytes(1),
                  'song_source': buff.readString(),
                  'song_tags': buff.readString(),
                  'online_offset': buff.readInt16(),
                  'title_font': buff.readString(),
                  'unplayed': buff.readBoolean(),
                  'last_played': buff.readInt64(),
                  'osz2': buff.readBoolean(),
                  'folder_name': buff.readString(),
                  'last_checked_against_repository': buff.readInt64(),
                  'ignore_sound': buff.readBoolean(),
                  'ignore_skin': buff.readBoolean(),
                  'disable_storyboard': buff.readBoolean(),
                  'disable_video': buff.readBoolean(),
                  'visual_override': buff.readBoolean()
                }

                if (osuver < 20140609) {
                  buff.readInt16()
                }
                beatmap['last_modification_time_2'] = buff.readInt32();

                beatmap['mania_scroll_speed'] = buff.readBytes(1)

                data.push(beatmap);
               
            }
        }
      }
      return data;
    }
  
    /**
     * Unmarshal's the buffer from the layout
     * @param {OsuBuffer|Buffer} raw
     * @param {Array|Object|Null} layout
     * @return {Object|Null}
     */
    UnmarshalPacket(raw, layout = null) {
      if (!raw) {
        return null;
      }
      let buff = raw;
      if (raw instanceof Buffer) {
        buff = OsuBuffer.from(raw);
      }
      let data = {};
      if (layout instanceof Array) {
        layout.forEach(item => {
          if(item.uses) {
            let needelements = item.uses.split(",")
            let dater = {}
            for (let datak of needelements) {
              dater[datak] = data[datak]
            }
            
            data[item.name] = this.Read(buff, item, item.uses ? dater : null);
          } else {
            data[item.name] = this.Read(buff, item);
          }
        });
      } else if (layout instanceof Object) {
        data = this.Read(buff, layout);
      }
      return data;
    }

  }
  
  module.exports = Reader;
