const mongoose = require('mongoose')
const Schema = mongoose.Schema

const HospitalSchema = new Schema({
    hospital_name: {
        type: String,
        required: true,
        trim: true,
        text: true
    },
    hostpital_id: {
        type: String,
        trim: true
    },
    hospital_type: {
        type: String,
        enum: ['goverment', 'private'],
        required: true,
        index: true
    },
    beds: {
        general_bads: {
            total: {
                type: Number,
                default: 0
            },
            available: {
                type: Number,
                default: 0
            }
        },
        o2_bads: {
            total: {
                type: Number,
                default: 0
            },
            available: {
                type: Number,
                default: 0
            }
        },
        without_o2_bads: {
            total: {
                type: Number,
                default: 0
            },
            available: {
                type: Number,
                default: 0
            }
        },
        hcu_hfnc_bads: {
            total: {
                type: Number,
                default: 0
            },
            available: {
                type: Number,
                default: 0
            }
        },
        icu_withoutventilator_bads: {
            total: {
                type: Number,
                default: 0
            },
            available: {
                type: Number,
                default: 0
            }
        },
        icu_ventilator_bads: {
            total: {
                type: Number,
                default: 0
            },
            available: {
                type: Number,
                default: 0
            }
        }
    },
    address: {
        address1: {
            type: String,
            trim: true
        },
        address2: {
            type: String,
            trim: true
        },
        zip: {
            type: Number,
            trim: true
        },
        city: {
            type: String,
            trim: true,
            index: true,
            lowercase: true
        },
        state: {
            type: String,
            trim: true,
            lowercase: true
        },
        country: {
            type: String,
            trim: true,
            lowercase: true
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        }
    },
    mobile_no: {
        type: Number,
        required: true,
        trim: true
    },
    tc_accepted: {
        type: Boolean,
        required: true
    },
    status: {
        type: String,
        trim: true,
        enum: ['active', 'blocked', 'deleted'],
        default: 'active',
        index: true
    },
    password: {
        type: String,
        trim: true
    }
}, { timestamps: true })

module.exports = mongoose.model('hospitals', HospitalSchema)
