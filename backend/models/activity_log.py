from app import db
from datetime import datetime

class ActivityLog(db.Model):
    __tablename__ = 'activity_log'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)
    duration = db.Column(db.Integer)
    distance = db.Column(db.Float)
    reps = db.Column(db.Integer)
    calories = db.Column(db.Integer)
    height = db.Column(db.Integer)
    weight = db.Column(db.Integer)
    age = db.Column(db.Integer)
    location = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    shared_from = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    visualization_type = db.Column(db.String(50), nullable=True)
    share_message = db.Column(db.Text, nullable=True)

    # 卡路里计算系数（每分钟消耗的卡路里）
    CALORIE_FACTORS = {
        'running': 10,      # 跑步：10卡/分钟
        'cycling': 8,       # 骑行：8卡/分钟
        'swimming': 9,      # 游泳：9卡/分钟
        'walking': 5,       # 步行：5卡/分钟
        'hiking': 7,        # 徒步：7卡/分钟
        'yoga': 4,          # 瑜伽：4卡/分钟
        'pushup': 6,        # 俯卧撑：6卡/分钟
        'situp': 5,         # 仰卧起坐：5卡/分钟
        'pullup': 7,        # 引体向上：7卡/分钟
        'other': 5          # 其他：5卡/分钟
    }

    def calculate_calories(self):
        """计算活动消耗的卡路里"""
        base_calories = 0
        
        # 根据活动类型获取基础消耗系数
        factor = self.CALORIE_FACTORS.get(self.activity_type, 5)
        
        # 基础消耗 = 时间 * 系数
        if self.duration:
            base_calories = self.duration * factor
        
        # 根据距离或次数增加消耗
        if self.distance:
            # 距离消耗 = 距离(km) * 体重(kg) * 0.1
            base_calories += self.distance * self.weight * 0.1
        
        if self.reps:
            # 次数消耗 = 次数 * 体重(kg) * 0.05
            base_calories += self.reps * self.weight * 0.05
        
        # 考虑年龄因素：年龄越大，消耗越少
        age_factor = 1.0
        if self.age:
            if self.age > 50:
                age_factor = 0.9
            elif self.age > 40:
                age_factor = 0.95
        
        # 最终卡路里 = 基础消耗 * 年龄系数
        return int(base_calories * age_factor) 