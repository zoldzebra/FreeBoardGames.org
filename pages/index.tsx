import React from 'react';
import FreeBoardGamesBar from 'components/App/FreeBoardGamesBar';
import Header from 'components/Header';
import { GamesList } from 'components/App/GamesList';
import SEO from 'components/SEO';
import { DesktopView, MobileView } from 'components/DesktopMobileView';

class Home extends React.Component<{}, {}> {
  render() {
    return (
      <FreeBoardGamesBar FEATURE_FLAG_readyForDesktopView>
        <MobileView>
          <SEO
            title={'Play Free Board Games Online'}
            description={
              'Play board games in your browser for free.  Compete against your online friends or play locally.  Free and open-source software project.'
            }
          />
          <Header />
          <GamesList />
        </MobileView>
      </FreeBoardGamesBar>
    );
  }
}

export default Home;
