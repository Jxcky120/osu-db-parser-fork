const fs = require('fs');
const { OsuReader } = require('osu-buffer');
const Reader = require("./Reader");
const { scoreStruct, osuDbStruct, collectionsStruct } = require("./Struct");

class OsuDBParser {
    /**
     * @param {Buffer} osuDbBuffer
     * @param {Buffer} osuCollectionBuffer
     */
    constructor(osuDbBuffer=null, osuCollectionBuffer=null,osuScoreBuffer=null) {
        this.reader = new Reader();
        
        this.canGetDBData = (osuDbBuffer !== null)
        this.canGetScoreDBData = (osuScoreBuffer !== null)
        this.canGetCollectionData = (osuCollectionBuffer !== null)

        if (this.canGetDBData) {
            this.dbfile = new OsuReader(osuDbBuffer.buffer);
            let dbosuData = this.reader.UnmarshalPacket(this.dbfile, osuDbStruct)
            dbosuData.isLocked = !dbosuData.isLocked
            this.osuDBData = dbosuData
        }
        if (this.canGetScoreDBData) {
            this.dbfile = new OsuReader(osuScoreBuffer.buffer);
            let dbosuData = this.reader.UnmarshalPacket(this.dbfile, scoreStruct)
            this.scoreDBData = dbosuData
        }
        if (this.canGetCollectionData) {
            this.collectionDB = new OsuReader(osuCollectionBuffer.buffer); 
            let collectionData = this.reader.UnmarshalPacket(this.collectionDB, collectionsStruct)
            this.collectionData = collectionData
        }           
    }

    /**
     * Set a buffer and parse him ;d
     * @param {String} type
     * @param {OsuBuffer} buffer
     * @return {Boolean}
     */
    setBuffer(type, buffer) {
        switch(type) {
            case "osudb": {
                try {
                    this.dbfile = osuBuffer.from(buffer);
                    let dbosuData = this.reader.UnmarshalPacket(this.dbfile, osuDbStruct)
                    dbosuData.isLocked = !dbosuData.isLocked
                    this.osuDBData = dbosuData
                    this.canGetDBData = true;
                } catch (e) {
                    console.log("Error while we had tried parse osu!.db")
                    console.log(e);
                }
                break;
            }
            case "scores": {
                try {
                    this.dbfile = osuBuffer.from(buffer);
                    let dbosuData = this.reader.UnmarshalPacket(this.dbfile, scoreStruct)
                    this.scoreDBData = dbosuData;
                    this.canGetScoreDBData = true;
                } catch (e) {
                    console.log("Error while we had tried parse score.db")
                    console.log(e);
                }
                break;
            }
            case "collection": {
                try {
                    this.collectionDB = osuBuffer.from(osuCollectionBuffer); 
                    let collectionData = this.reader.UnmarshalPacket(this.collectionDB, collectionsStruct)
                    this.collectionData = collectionData
                    this.canGetCollectionData = true;
                } catch (e) {
                    console.log("Error while we had tried parse collection.db")
                    console.log(e);
                }
                break;
            }
        }
        return true;
    }

    /**
     * Get osu DB data if present
     * @return {Object}
     */
    getOsuDBData() {
        return (this.canGetDBData) ? this.osuDBData : null;
    }

    /**
     * Get collection DB data if present
     * @return {Object}
     */
    getCollectionData() {
        return (this.canGetCollectionData) ? this.collectionData : null;
    }
    /**
     * Get Score DB data if present
     * @return {Object}
     */
    getScoreData() {
        return (this.canGetScoreDBData) ? this.scoreDBData : null;
    }
}

module.exports = OsuDBParser
    