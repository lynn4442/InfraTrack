from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["infra_db"]

technicians = db["technicians"]
assets = db["assets"]
incidents = db["incidents"]
