$(function() {

    Vue.filter('two_digits', function(value) {
        if (value.toString().length <= 1) {
            return '0' + value.toString();
        }
        return value.toString();
    });

    Vue.component('countdown', {
        template: '<div class="countdown"> \
                    <div class="countdown-title" v-if="show">{{ title }}</div>\
                    <div class="countdown-title" v-if="ended">{{ endedLabel }}</div>\
                    <div class="countdown-digits" v-if="show"> \
                        <p class="countdown-digit">{{ days | two_digits }}</p> \
                        <p class="countdown-label">Days</p> \
                    </div> \
                    <div class="countdown-digits" v-if="show"> \
                        <p class="countdown-digit">{{ hours | two_digits }}</p> \
                        <p class="countdown-label">Hours</p> \
                    </div> \
                    <div class="countdown-digits" v-if="show"> \
                        <p class="countdown-digit">{{ minutes | two_digits }}</p> \
                        <p class="countdown-label">Minutes</p> \
                    </div> \
                    <div class="countdown-digits" v-if="show"> \
                        <p class="countdown-digit">{{ seconds | two_digits }}</p> \
                        <p class="countdown-label">Seconds</p> \
                    </div> \
                </div>',

        mounted: function() {
            window.setInterval(() => {
                this.now = Math.trunc((new Date()).getTime() / 1000);
            },1000);
        },

        props: {
            title: {
                type: String
            },
            date: {
                type: String
            },
            start: {
                type: String
            },
            endedLabel: {
                type: String
            }
        },

        data() {
            return {
                now: Math.trunc((new Date()).getTime() / 1000)
            }
        },

        computed: {
            show() {
                return (this.now < this.dateCoerce && (this.now > this.startCoerce || this.startCoerce === 0))
            },
            ended() {
                return (this.now > this.dateCoerce);
            },
            dateCoerce: function() {
                return Math.trunc(Date.parse(this.date) / 1000)
            },
            startCoerce: function() {
                return typeof this.start !== 'undefined' ? Math.trunc(Date.parse(this.start) / 1000) : 0
            },
            seconds() {
                return (this.dateCoerce - this.now) % 60;
            },

            minutes() {
                return Math.trunc((this.dateCoerce - this.now) / 60) % 60;
            },

            hours() {
                return Math.trunc((this.dateCoerce - this.now) / 60 / 60) % 24;
            },

            days() {
                return Math.trunc((this.dateCoerce - this.now) / 60 / 60 / 24);
            }
        }
    });

    new Vue({
        el: '#counters'
    });
});








