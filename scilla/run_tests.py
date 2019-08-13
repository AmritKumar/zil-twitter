import os
testsuite = [
    {
        "dir": "deposit_tests",
        "tests": [
            {
                "message": "deposit_fail",
                "output": "deposit_fail",
                "state": "deposit_fail"
            },
            {
                "message": "deposit_success",
                "output": "deposit_success",
                "state": "deposit_success"
            }     
        ]
    },
    {
        "dir": "new_tweet_tests",
        "tests": [
            {
                "message": "new_tweet",
                "output": "new_tweet_fail_tweet_verified",
                "state": "new_tweet_fail_tweet_verified"
            },
            {
                "message": "new_tweet",
                "output": "new_tweet_fail_tweet_unverified",
                "state": "new_tweet_fail_tweet_unverified"
            },
            {
                "message": "new_tweet",
                "output": "new_tweet_success",
                "state": "new_tweet_success"
            },
            {
                "message": "new_tweet",
                "output": "new_tweet_fail_user",
                "state": "new_tweet_fail_user"
            }
        ]
    },
    {
        "dir": "register_user_tests",
        "tests": [
            {
                "message": "register_user",
                "output": "register_user_fail_user",
                "state": "register_user_fail_user"
            },
            {
                "message": "register_user",
                "output": "register_user_fail_username",
                "state": "register_user_fail_username"
            },
            {
                "message": "register_user",
                "output": "register_user_success",
                "state": "register_user_success"
            }
        ]
    },
    {
        "dir": "verify_tweet_tests",
        "tests": [
            {
                "message": "verify_tweet_fail_hashtag",
                "output": "verify_tweet_fail_hashtag",
                "state": "verify_tweet_success"
            },
            {
                "message": "verify_tweet_fail_invalid_end_pos",
                "output": "verify_tweet_fail_invalid_end_pos",
                "state": "verify_tweet_success"
            },
            {
                "message": "verify_tweet_fail_invalid_user",
                "output": "verify_tweet_fail_invalid_user",
                "state": "verify_tweet_success"
            },
            {
                "message": "verify_tweet_fail_owner",
                "output": "verify_tweet_fail_owner",
                "state": "verify_tweet_success"
            },
            {
                "message": "verify_tweet_success",
                "output": "verify_tweet_fail_tweet_unverified",
                "state": "verify_tweet_fail_tweet_unverified"
            },
            {
                "message": "verify_tweet_success",
                "output": "verify_tweet_fail_verified",
                "state": "verify_tweet_fail_verified"
            },
            {
                "message": "verify_tweet_success",
                "output": "verify_tweet_fail_within_day",
                "state": "verify_tweet_fail_within_day"
            },
            {
                "message": "verify_tweet_success",
                "output": "verify_tweet_success",
                "state": "verify_tweet_success"
            },
            {
                "message": "verify_tweet_success",
                "output": "verify_tweet_success_overwrite",
                "state": "verify_tweet_success_overwrite"
            },
        ]
    }
]
SCILLA_DIR = "/Users/advaypal/Desktop/Repos/zilliqa/scilla"
for test in testsuite:
    test_directory = test["dir"]
    for test in test["tests"]:
        message = f"{test_directory}/message_{test['message']}.json"
        output = f"{test_directory}/output_{test['output']}.json"
        state = f"{test_directory}/state_{test['state']}.json"
        command = f"{SCILLA_DIR}/bin/scilla-runner -init init.json -istate {state} -iblockchain blockchain.json -imessage {message} -o {output} -i Twitter.scilla -libdir {SCILLA_DIR}/src/stdlib -gaslimit 8000"
        os.system(command)