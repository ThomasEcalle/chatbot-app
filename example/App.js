import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {GiftedChat, Actions, Bubble, SystemMessage} from 'react-native-gifted-chat';
import CustomActions from './CustomActions';
import CustomView from './CustomView';

const dialogflow_url = "https://api.dialogflow.com/v1/"
const dialogflow_client_token = "37ca0e40b7a74671bce9f0a4e2ce146b"

export default class Example extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            loadEarlier: true,
            typingText: null,
            isLoadingEarlier: false,
        };

        this._isMounted = false;
        this.onSend = this.onSend.bind(this);
        this.onReceive = this.onReceive.bind(this);
        this.renderCustomActions = this.renderCustomActions.bind(this);
        this.renderBubble = this.renderBubble.bind(this);
        this.renderSystemMessage = this.renderSystemMessage.bind(this);
        this.renderFooter = this.renderFooter.bind(this);
        this.onLoadEarlier = this.onLoadEarlier.bind(this);

        this._isAlright = null;
    }

    componentWillMount() {
        this._isMounted = true;
        this.setState(() => {
            return {
                messages: require('./data/messages.js'),
            };
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onLoadEarlier() {
        this.setState((previousState) => {
            return {
                isLoadingEarlier: true,
            };
        });

        setTimeout(() => {
            if (this._isMounted === true) {
                this.setState((previousState) => {
                    return {
                        messages: GiftedChat.prepend(previousState.messages, require('./data/old_messages.js')),
                        loadEarlier: false,
                        isLoadingEarlier: false,
                    };
                });
            }
        }, 1000); // simulating network
    }

    onSend(messages = []) {
        console.log("Message envoyé : " + JSON.stringify(messages))
        this.setState((previousState) => {
            return {
                messages: GiftedChat.append(previousState.messages, messages),
            };
        });


        // for demo purpose
        this.answerDemo(messages);
    }

    answerDemo(messages) {

        this.setState((previousState) => {
            return {
                typingText: 'React Native is typing'
            };
        });

        return fetch("https://api.dialogflow.com/v1/query?v=20150910&contexts=shop&lang=en&query=" + messages[0].text + "&sessionId=12345&timezone=France/Paris", {
            method: 'get',
            headers: {
                'Authorization': 'Bearer 78cc544d14a542a7891f44d39328b481'
            },
        })
            .then((response) => response.json())
            .then((responseJson) => {

                this.setState((previousState) => {
                    return {
                        typingText: null
                    };
                });
                console.log(responseJson)
                this.onReceive(responseJson.result.fulfillment.messages[0].speech)
                return responseJson
            })
            .catch((error) => {
                console.error(error);
            });

    }

    onReceive(text) {
        this.setState((previousState) => {
            return {
                messages: GiftedChat.append(previousState.messages, {
                    _id: Math.round(Math.random() * 1000000),
                    text: text,
                    createdAt: new Date(),
                    user: {
                        _id: 2,
                        name: 'React Native',
                        // avatar: 'https://facebook.github.io/react/img/logo_og.png',
                    },
                }),
            };
        });
    }

    renderCustomActions(props) {
        if (Platform.OS === 'ios') {
            return (
                <CustomActions
                    {...props}
                />
            );
        }
        const options = {
            'Action 1': (props) => {
                alert('option 1');
            },
            'Action 2': (props) => {
                alert('option 2');
            },
            'Cancel': () => {
            },
        };
        return (
            <Actions
                {...props}
                options={options}
            />
        );
    }

    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    left: {
                        backgroundColor: '#f0f0f0',
                    }
                }}
            />
        );
    }

    renderSystemMessage(props) {
        return (
            <SystemMessage
                {...props}
                containerStyle={{
                    marginBottom: 15,
                }}
                textStyle={{
                    fontSize: 14,
                }}
            />
        );
    }

    renderCustomView(props) {
        return (
            <CustomView
                {...props}
            />
        );
    }

    renderFooter(props) {
        if (this.state.typingText) {
            return (
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>
                        {this.state.typingText}
                    </Text>
                </View>
            );
        }
        return null;
    }

    render() {
        return (
            <GiftedChat
                messages={this.state.messages}
                onSend={this.onSend}
                loadEarlier={this.state.loadEarlier}
                onLoadEarlier={this.onLoadEarlier}
                isLoadingEarlier={this.state.isLoadingEarlier}

                user={{
                    _id: 1, // sent messages should have same user._id
                }}

                renderActions={this.renderCustomActions}
                renderBubble={this.renderBubble}
                renderSystemMessage={this.renderSystemMessage}
                renderCustomView={this.renderCustomView}
                renderFooter={this.renderFooter}
            />
        );
    }
}

const styles = StyleSheet.create({
    footerContainer: {
        marginTop: 5,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
    },
    footerText: {
        fontSize: 14,
        color: '#aaa',
    },
});
