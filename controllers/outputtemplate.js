module.exports = {
    getCard: function(element_data, buttons_data) {
        var Template = this;
        var card = {
            title: element_data.title,
            subtitle: (element_data.rating) ? "rating: "+element_data.rating+", address: "+ element_data.subtitle : element_data.subtitle,
            image_url: element_data.icon,
            buttons: []
        }
        buttons_data.forEach(function(button_data) {
            card.buttons.push(Template.getButton(button_data));
        })
        return card
    },
    getButton: function(button_data) {
        var button = {};
        switch (button_data.type) {
            case 'web_url':
                button = {
                    type: button_data.type,
                    url: button_data.url,
                    title: button_data.title,
                    webview_height_ratio: "compact"
                }
                break;
            case 'postback':
                button = {
                    type: button_data.type,
                    title: button_data.title,
                    payload: "DEVELOPER_DEFINED_PAYLOAD"
                }
                break;
            default:
                button = {
                    type: button_data.type,
                    title: button_data.title,
                    payload: "DEVELOPER_DEFINED_PAYLOAD"
                }
        }
        return button
    },
    getGeneric: function(elements) {
        return {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: elements
                }
            }
        }
    },
    getList: function(elements) {
        elements = elements.slice(0,4)
        return {
            attachment: {
                type: "template",
                payload: {
                    template_type: "list",
                    top_element_style: "compact",
                    elements: elements
                }
            }
        }
    }
};