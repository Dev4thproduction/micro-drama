const User = require('../models/User');
const Series = require('../models/Series');

exports.getMyList = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'myList',
                match: { status: 'published' }
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user.myList
        });
    } catch (error) {
        next(error);
    }
};

exports.addToMyList = async (req, res, next) => {
    try {
        const { seriesId } = req.params;

        const series = await Series.findById(seriesId);
        if (!series) {
            return res.status(404).json({ message: 'Series not found' });
        }

        const user = await User.findById(req.user.id);
        if (user.myList.includes(seriesId)) {
            return res.status(400).json({ message: 'Series already in your list' });
        }

        user.myList.push(seriesId);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Series added to your list'
        });
    } catch (error) {
        next(error);
    }
};

exports.removeFromMyList = async (req, res, next) => {
    try {
        const { seriesId } = req.params;

        const user = await User.findById(req.user.id);
        user.myList = user.myList.filter(id => id.toString() !== seriesId);
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Series removed from your list'
        });
    } catch (error) {
        next(error);
    }
};

exports.checkMyListStatus = async (req, res, next) => {
    try {
        const { seriesId } = req.params;
        const user = await User.findById(req.user.id);

        const isInList = user.myList.some(id => id.toString() === seriesId);

        res.status(200).json({
            success: true,
            isInList
        });
    } catch (error) {
        next(error);
    }
};
