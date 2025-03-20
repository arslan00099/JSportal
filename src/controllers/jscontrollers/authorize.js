require('dotenv').config();
const axios = require('axios');

const API_LOGIN_ID = process.env.API_LOGIN_ID;
const TRANSACTION_KEY = process.env.TRANSACTION_KEY;
const API_URL = "https://api2.authorize.net/xml/v1/request.api";

exports.charge = async (req, res) => {
    const { amount, cardNumber, expDate, cardCode } = req.body;

    if (!amount || !cardNumber || !expDate || !cardCode) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const requestData = {
        createTransactionRequest: {
            merchantAuthentication: {
                name: API_LOGIN_ID,
                transactionKey: TRANSACTION_KEY
            },
            transactionRequest: {
                transactionType: "authCaptureTransaction",
                amount: amount,
                payment: {
                    creditCard: {
                        cardNumber: cardNumber,
                        expirationDate: expDate,
                        cardCode: cardCode
                    }
                }
            }
        }
    };

    try {
        const response = await axios.post(API_URL, requestData, {
            headers: { "Content-Type": "application/json" }
        });

        if (response.data.messages.resultCode === "Ok") {
            return res.json({
                success: true,
                transactionId: response.data.transactionResponse.transId
            });
        } else {
            return res.status(400).json({
                success: false,
                error: response.data.messages.message[0].text
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.response ? error.response.data : error.message
        });
    }
};
